from datetime import datetime, timedelta
import json

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from fastapi.security import HTTPBearer
from sqlalchemy import func
from sqlalchemy.orm import Session

from services.web_socket_service import manager
from config.db import get_db
from models.historial_model import Registro
from models.machine_model import Machine
from models.solicitud_model import Solicitud
from models.ticket_model import Ticket
from models.user_model import User
from schemas.ticket_schema import (
    Record,
    PaginatedTickets,
    TicketCloseInfo,
    TicketCreate,
    TicketStandartResponse,
    TicketSolicitudInfo
)


bearer_scheme = HTTPBearer()

# Crear un router para los tickets
ticket_router = APIRouter(tags=["Tickets"],prefix="/tickets")

@ticket_router.get(
    "/tickets", 
    summary="Obtener todos los tickets",
    description="Obtiene una lista de todos los tickets. Se pueden filtrar por estado, id del creador o id del usuario asignado.",
    response_model=PaginatedTickets,
    response_description="Un JSON con la información de los tickets paginados."
)
async def get_all_tickets(
    state: Optional[str] = Query(None, title="Estado del ticket a filtrar", description="Puede ser 'pendiente', 'asignado', 'en proceso', o 'finalizado','pendiente a revision','cerrado'"),
    creator_id: Optional[int] = Query(None, title="ID del creador del ticket a filtrar"),
    assignee_id: Optional[int] = Query(None, title="ID del usuario asignado del ticket a filtrar"),
    page: int = Query(1, ge=1, description="Número de la página que se desea obtener. Comienza en 1."),  
    limit: int = Query(10, ge=1, description="Cantidad de tickets por página. Valor predeterminado: 10."),
    db: Session = Depends(get_db),
    token: str = Depends(bearer_scheme)
):
    """
    Obtiene todos los tickets, con opción de filtrar por estado, ID del creador o ID del usuario asignado.

    Parámetros:
    - state: Estado del ticket a filtrar.
    - creator_id: ID del creador del ticket a filtrar.
    - assignee_id: ID del usuario asignado a los tickets a filtrar.
    - page: Número de la página que se desea obtener.
    - limit: Cantidad de tickets por página.

    Retorna:
    - Un objeto de PaginatedTickets que incluye los tickets y detalles de paginación.
    """

    # Calcular el offset en base al número de página
    offset = (page - 1) * limit

    query = db.query(Ticket)

    # Filtrar por estado
    if state:
        query = query.filter(Ticket.state == state)

    # Filtrar por ID del creador
    if creator_id:
        query = query.filter(Ticket.created_by == creator_id)

    # Filtrar por ID del usuario asignado
    if assignee_id:
        query = query.filter(Ticket.assigned_to == assignee_id)

    # Total de tickets en la base de datos considerando el filtro
    total_tickets = query.count()

    # Consultar los tickets con límite y offset para paginación
    tickets = query.offset(offset).limit(limit).all()

    if not tickets:
        raise HTTPException(status_code=404, detail="No se encontraron tickets que coincidan con los filtros.")

    # Preparar la respuesta
    ticket_responses = []
    for ticket in tickets:
        creator = ticket.creator
        assigned_user = ticket.assignee
        ticket_responses.append(
            TicketStandartResponse(
                id=ticket.id,
                description=ticket.description,
                state=ticket.state,
                created_at=ticket.created_at,
                priority=ticket.priority,
                deadline=ticket.deadline,
                machine_id=ticket.machine_id,
                created_by={
                    "id": creator.id,
                    "name": f"{creator.first_name} {creator.last_name}",
                    "email": creator.email,
                    "rol_id": creator.role_id
                },
                assigned_to=(
                    {
                        "id": assigned_user.id,
                        "name": f"{assigned_user.first_name} {assigned_user.last_name}",
                        "email": assigned_user.email,
                        "rol_id": assigned_user.role_id
                    } if assigned_user else None
                ),
                related_open_requests=[{
                    "id": solicitud.id,
                    "type": solicitud.type
                } for solicitud in ticket.solicitudes if solicitud.status == "pendiente"]
            )
        )

    # Determinar si es la última página
    is_last_page = len(tickets) < limit or (page * limit >= total_tickets)

    # Retornar los datos de paginación y los tickets
    paginated_response = PaginatedTickets(
        page=page,
        limit=limit,
        total_tickets=total_tickets,
        tickets=ticket_responses,
        is_last_page=is_last_page
    )

    return paginated_response


@ticket_router.post(
    "/ticket",
    summary="Crear un ticket como solicitud de revision",
    description="""Solicitar una revisión de una maquina a traves de un ticket, 
    crea un nuevo ticket con el estado predeterminado 'pendiente'.""",
    response_model=TicketStandartResponse
)
async def create_ticket(
    request: Request = None,
    ticket: TicketCreate = None,
    db: Session = Depends(get_db),
    dependencies = Depends(HTTPBearer())
):
    """
    Crea un nuevo ticket con el estado predeterminado 'pendiente'.
    
    Parámetros:
        ticket: Los datos del ticket a crear, descripción, id de la máquina a la que 
            pertenece el ticket y prioridad (description, machine, priority).
    
    Retorna:
        Datos del ticket creado.
    """
    # Verificar si la máquina existe en la base de datos
    machine = db.query(Machine).filter(Machine.id == ticket.machine).first()
    if not machine:
        raise HTTPException(status_code=404, detail="La máquina con el serial proporcionado no existe.")

    user_info = request.state.user  
    user_id = user_info.get("sub")
    
    # Validar que el usuario existe en la base de datos
    creator = db.query(User).filter(User.id == user_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Usuario creador no encontrado.")

    priority_deadlines = {
        'baja': timedelta(weeks=1),
        'media': timedelta(days=3),
        'alta': timedelta(days=1)
    }

    if ticket.priority not in priority_deadlines:
        raise HTTPException(status_code=404, detail="Prioridad no válida.")

    # Calcular el deadline según la prioridad
    deadline = datetime.now() + priority_deadlines[ticket.priority]
    
    # Crear el ticket si la máquina existe
    new_ticket = Ticket(
        description=ticket.description,
        state="pendiente",  
        machine_id=machine.id,
        priority=ticket.priority,
        created_by=user_id,
        created_at=func.now(), 
        deadline=deadline
    )
    
    db.add(new_ticket) 
    db.commit()
    db.refresh(new_ticket)
    # Crear un registro de creación del ticket
    new_registro = Registro(
        description=f"Creación del ticket {new_ticket.id} por el usuario con nombre {creator.first_name} {creator.last_name} y con id: {user_id}",
        event_type="creación",
        ticket_id=new_ticket.id
    )  
    
    db.add(new_registro)
    db.commit()
    
    await manager.send_personal_message(
        {
            "message": f"Has creado un nuevo ticket con ID {new_ticket.id} para la máquina {machine.id}.",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        user_id
    )
    
    # Retornar la información del ticket creado
    return TicketStandartResponse(
        id=new_ticket.id,
        description=new_ticket.description,
        state=new_ticket.state,
        created_at=new_ticket.created_at,
        priority=new_ticket.priority, 
        deadline=new_ticket.deadline,
        machine_id=machine.id,  
        created_by={
            "id": creator.id, 
            "name": f"{creator.first_name} {creator.last_name}", 
            "email": creator.email,
            "rol_id": creator.role_id
        }
    )

@ticket_router.get(
    "/ticket/{ticket_id}", 
    summary="Obtener un ticket por su ID",
    description="Obtiene un ticket por su ID, incluyendo los nombres completos y los IDs de las personas involucradas.",
    response_model=TicketStandartResponse
)
async def get_ticket(
    ticket_id: int = Path(..., title="ID del ticket a buscar"), 
    db: Session = Depends(get_db), 
    dependencies=Depends(bearer_scheme)
):
    """
    Obtiene un ticket por su ID, incluyendo los nombres completos y los IDs de las personas involucradas.
    """
    # Unimos el ticket con la máquina y los usuarios (creador y asignado) para obtener la información necesaria
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    # Obtener el creador del ticket
    creator = ticket.creator
    if not creator:
        raise HTTPException(status_code=404, detail="Usuario creador no encontrado")
    created_by_name = f"{creator.first_name} {creator.last_name}"

    responsable = ticket.assignee
    if responsable:
        responsable_info = {
            "id": responsable.id,
            "name": f"{responsable.first_name} {responsable.last_name}",
            "email": responsable.email,
            "rol_id": responsable.role_id
        }
    else:
        responsable_info = None
        
    related_open_requests = []
    for solicitud in ticket.solicitudes:
        if solicitud.status == "pendiente":
            solicitud_data = {
                "id": solicitud.id,
                "type": solicitud.type
            }
            related_open_requests.append(solicitud_data)
    
    return TicketStandartResponse(
        id=ticket.id,
        description=ticket.description,
        state=ticket.state,
        created_at=ticket.created_at,
        priority=ticket.priority,
        deadline=ticket.deadline,
        machine_id=ticket.machine_id,
        created_by={
            "id": creator.id,
            "name": created_by_name,
            "email": creator.email,
            "rol_id": creator.role_id
        },
        assigned_to=responsable_info,
        related_open_requests=related_open_requests
    )

@ticket_router.patch(
    "/ticket/assing/{ticket_id}",
    summary="Asignar un responsable a un ticket",
    description="""Puede autoasignarse el ticket o asignarlo a otra persona si es un jefe de mantenimiento
    si no es omitido se verifica que el usuario sea un jefe de mantenimiento, que es el 
    unico con el poder de asignarle un ticket a otro usuario."""
)
async def assign_ticket(
    req : Request,
    ticket_id : str = Path(..., title="ID del ticket a asignar"),
    user_id: Optional[str] = Query(None, title="Usuario al que se le asigna el ticket"), 
    db: Session = Depends(get_db),
    token: str = Depends(bearer_scheme)
):
    """
    Asignar un responsable de atencion del ticket:
    Si se omite el parametro user_id se autoasigna la responsabilidad del ticket,
    si no es omitido se verifica que el usuario sea un jefe de mantenimiento, que es el
    unico con el poder de asignarle un ticket a otro usuario.
    
    Parámetros:
        ticket_id: ID del ticket a editar
        user_id: el id de la persona a la cual se le asiganara el ticket (assigned_to).
    
    Retorna:
       Información del ticket actualizado.
    """
    
    user_to_assing = None
    
    if user_id  != None:
        aux_user = req.state.user
        
        if aux_user.get("scopes") != 4:
            raise HTTPException(status_code=400,detail="No tienes permiso para realizar esta accion (No eres jefe de mantenimiento)")
        user_to_assing = user_id
        
    else:
        user_to_assing = req.state.user.get("sub")
        
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    if ticket.state == "finalizado":
        raise HTTPException(status_code=400, detail="No se puede asignar otro estado a un ticket finalizado")
    
    if ticket.assignee:
        if user_id == None:
            raise HTTPException(status_code=400, detail="No puedes asignarte un ticket que ya tiene un responsable asignado")
            
    user = db.query(User).filter(User.id == user_to_assing).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario al que se le asignara el ticket no encontrado")
    
    ticket.assigned_to = user.id
    ticket.state = "asignado"
    db.commit()
    db.refresh(ticket)
    
    new_registro = Registro(
        description=f"Se asigna {ticket.assignee.first_name} {ticket.assignee.last_name}(id: {ticket.assignee.id}).",
        event_type="asignacion",
        ticket_id=ticket.id
    )  
    
    db.add(new_registro)
    db.commit()
    
    related_open_requests = []
    for solicitud in ticket.solicitudes:
        if solicitud.status == "pendiente":
            solicitud_data = {
                "id": solicitud.id,
                "type": solicitud.type
            }
            related_open_requests.append(solicitud_data)
            
    await manager.send_personal_message(
        {
            "message": f"Se ha asignado tu ticket con id {ticket.id} para la maquina {ticket.machine_id} a {user.first_name} {user.last_name}. (id: {user.id})",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        ticket.created_by
    )
    
    await manager.send_personal_message(
        {
            "message": f"Se te ha asignado el ticket con id {ticket.id} para la maquina {ticket.machine_id}",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        user.id
    )
    
    return TicketStandartResponse(
        id=ticket.id,
        description=ticket.description,
        state=ticket.state,
        created_at=ticket.created_at,
        priority=ticket.priority, 
        deadline=ticket.deadline,
        machine_id=ticket.machine_id,  
        created_by={
            "id": ticket.creator.id, 
            "name": f"{ticket.creator.first_name} {ticket.creator.last_name}", 
            "email": ticket.creator.email,
            "rol_id": ticket.creator.role_id
        },
        assigned_to={
            "id": user.id, 
            "name": f"{user.first_name} {user.last_name}", 
            "email": user.email,
            "rol_id": user.role_id
        },
        related_open_requests=related_open_requests
    )

@ticket_router.patch(
    "/ticket/{ticket_id}/{ticket_state}",
    summary="Cambiar el estado de un ticket",
    description="""Cambia el estado de un ticket (a excepción de finalizado o en caso de que ya esté finalizado)
    Los estados validos son: asignado, en proceso, pendiente""",
    response_model=TicketStandartResponse
)
async def change_ticket_state(
    req:Request,
    ticket_id: int = Path(..., title="ID del ticket a editar", description="ID del ticket a editar"),
    ticket_state: str = Path(..., title="Estado al que se va a cambiar el ticket", description="Estado al que se va a cambiar el ticket"), 
    db: Session = Depends(get_db),
    dependencies = Depends(bearer_scheme)    
):
    """
    Cambia el estado de un ticket (a excepción de finalizado o en caso de que ya esté finalizado) 

    Parámetros:
    - ticket_id: ID del ticket a editar
    - ticket_update: el estado al cual va a cambiar el ticket (state).
    - db: Sesión de la base de datos. (Dependencia)
    
    Retorna:
    - Información del ticket actualizado.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if ticket_state not in ["asignado", "en proceso", "pendiente"]:
        raise HTTPException(status_code=400, detail="Estado no válido para cambio directo.")

    if ticket.state == "finalizado" or ticket.state == "pendiente a revision":
        raise HTTPException(status_code=400, detail="No se puede cambiar el estado de un ticket finalizado o en espera de aprobación de cierre.")

    user  = req.state.user
    
    if ticket.assigned_to != user.get("sub"):
        raise HTTPException(status_code=400, detail="No tienes permiso para realizar esta accion (No eres el responsable del ticket)")

    # Actualizar el estado del ticket
    ticket.state = ticket_state
    db.commit()
    db.refresh(ticket)
            
    new_registro = Registro(
        description=f"Se ha cambiado el estado del ticket a {ticket_state}",
        event_type="cambio de estado",
        ticket_id=ticket.id
    )  
    
    db.add(new_registro)
    db.commit()     
            
    related_open_requests = []
    for solicitud in ticket.solicitudes:
        if solicitud.status == "pendiente":
            solicitud_data = {
                "id": solicitud.id,
                "type": solicitud.type
            }
            related_open_requests.append(solicitud_data)
            
    await manager.send_personal_message(
        {
            "message": f"Se ha cambiado el estado de tu ticket con id {ticket.id} para la maquina {ticket.machine_id} a {ticket_state}.",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        ticket.created_by
    )
    
    await manager.send_personal_message(
        {
            "message": f"Se ha cambiado el estado del ticket con id {ticket.id} para la maquina {ticket.machine_id} del que eres encargado a {ticket_state}.",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        ticket.assigned_to
    )
    
    return TicketStandartResponse(
        id=ticket.id,
        description=ticket.description,
        state=ticket.state,
        created_at=ticket.created_at,
        priority=ticket.priority, 
        deadline=ticket.deadline,
        machine_id=ticket.machine_id,  
        created_by={
            "id": ticket.creator.id, 
            "name": f"{ticket.creator.first_name} {ticket.creator.last_name}", 
            "email": ticket.creator.email,
            "rol_id": ticket.creator.role_id
        },
        assigned_to={
            "id": ticket.assignee.id, 
            "name": f"{ticket.assignee.first_name} {ticket.assignee.last_name}", 
            "email": ticket.assignee.email,
            "rol_id": ticket.assignee.role_id
        },
        related_open_requests=related_open_requests
    )
    
@ticket_router.post(
    "/ticket/solicitar-cierre/{ticket_id}",
    summary="Solicitar cierre de un ticket",
    description="""Solicitar el cierre de un ticket si el estado está en proceso. Solo el creador del ticket puede hacerlo.""",
    response_model=TicketSolicitudInfo
)
async def request_ticket_closure(
    req: Request,
    ticket_id: int = Path(..., title="ID del ticket a solicitar cierre", description="ID del ticket a solicitar cierre"),
    close_info: TicketCloseInfo = None,
    db: Session = Depends(get_db),
    token: str = Depends(bearer_scheme)
):
    """
    Permite que el creador de un ticket solicite su cierre si está en estado 'en proceso'.
    El ticket pasará a estado 'pendiente a revisión' y se creará una solicitud de cierre.
    """
    # Obtener el ticket desde la base de datos
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    # Verificar si ya existe una solicitud de cierre pendiente para este ticket
    solicitud_existente = db.query(Solicitud).filter(
        Solicitud.ticket_id == ticket_id, 
        Solicitud.type == "cierre",
        Solicitud.status == "pendiente"
    ).first()

    if solicitud_existente:
        raise HTTPException(status_code=400, detail="Ya existe una solicitud de cierre pendiente para este ticket.")

    if ticket.state != "en proceso":
        raise HTTPException(status_code=400, detail="El ticket no está en estado 'en proceso'.")

    user_id = req.state.user.get("sub")
    
    if ticket.assigned_to != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para realizar esta acción (No eres el creador del ticket).")
    
    # Serializar la información en JSON
    solicitud_data = {
        "user_id": user_id,
        "user_response_id": None,
        "detalles": close_info.model_dump() if close_info else {}  # Convertir la info adicional en JSON
    }
    solicitud_json = json.dumps(solicitud_data)

    # Crear la nueva solicitud de cierre
    nueva_solicitud = Solicitud(
        ticket_id=ticket_id,
        description=solicitud_json,  # Almacenar la info en el campo description
        type="cierre",
        status="pendiente"
    )
    
    db.add(nueva_solicitud)
    ticket.state = "pendiente a revision"
    db.commit()
    

    new_registro = Registro(
        description=f"Se ha solicitado aprobación para el cierre del ticket. Id de la solicitud: {nueva_solicitud.id}",
        event_type="solicitud de cierre",
        ticket_id=ticket.id
    )  
    
    db.add(new_registro)
    db.commit()  
    
    await manager.send_personal_message(
        {
            "message": f"Se ha solicitado el cierre de tu ticket con id {ticket.id} para la maquina {ticket.machine_id}",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        ticket.created_by
    )
    
    await manager.send_personal_message(
        {
            "message": f"Se ha solicitado el cierre del ticket con id {ticket.id} para la maquina {ticket.machine_id} del que eres encargado a.",
            "type":"info",
            "timestamp": datetime.now().isoformat()
        },
        ticket.assigned_to
    )  

    return TicketSolicitudInfo(
        detail="Solicitud de cierre enviada correctamente. Sera notificado con la respuesta.",
        id_solicitud=nueva_solicitud.id
    )
    
@ticket_router.get(
    "/ticket/seguimiento/{ticket_id}",
    summary="Obtener el seguimiento historico de un ticket",
    description="""Obtiene el historial de un ticket, incluyendo los nombres completos y los IDs de las personas involucradas.
    Se retorna en orden cronologico descendente.""",
    response_model=List[Record]
)
def records(
    req: Request,
    ticket_id: int = Path(..., title="ID del ticket a solicitar cierre", description="ID del ticket a obtener el historial"),
    db: Session = Depends(get_db),
    token: str = Depends(bearer_scheme)
):
    history = db.query(Registro).filter(Registro.ticket_id == ticket_id).order_by(Registro.created_at.asc()).all()
    
    if not history:
        raise HTTPException(status_code=404, detail="No se encontraron registros para el ticket.")
    
    records = []
    
    for record in history:
        records.append(
            Record(
                id=record.id,
                description=record.description,
                event_type=record.event_type,
                created_at=record.created_at
            )
        )
        
    return records
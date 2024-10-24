from datetime import datetime, timedelta
import httpx
import io

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from datetime import datetime

from config.db import get_db
from config.config import get_route_pdf
from models.ticket_model import Ticket


admin_router = APIRouter(
    tags=["Acciones del personal administrativo"],
    prefix="/admin"
)

@admin_router.get(
    "/obtener_reporte",
    summary="Obtener un reporte de tickets de mantenimiento.",
    description="Obtener un reporte del mantenimiento entre ciertas fechas y filtrado por parametros opcionales.",
    response_description="Reporte de tickets de mantenimiento en formato pdf.",
)
async def get_report(
    db: Session = Depends(get_db),
    token: str = Depends(HTTPBearer()),
    initial_date: str = Query(
        ..., 
        description="Fecha inicial del reporte en formato YYYY-MM-DD. Ejemplo: 2024-10-01",
        example="2024-10-01"
    ),
    final_date: str = Query(
        ..., 
        description="Fecha final del reporte en formato YYYY-MM-DD.",
        example="2024-10-31"
    ),
    machine_id: str = Query(None, description="ID de la máquina para filtrar el reporte. Opcional."),
    user_id: str = Query(None, description="ID del usuario creador para filtrar el reporte. Opcional."),
    assigne_id: str = Query(None, description="ID del asignado para filtrar el reporte. Opcional.")
):
    # Parsear las fechas recibidas
    try:
        initial_date = datetime.strptime(initial_date, "%Y-%m-%d")
        final_date = datetime.strptime(final_date, "%Y-%m-%d")
        final_date = final_date + timedelta(days=1) - timedelta(seconds=1)
    except ValueError:
        return HTTPException(status_code=400, detail="Formato de fecha incorrecto. Usa el formato YYYY-MM-DD.")

    # Crear la base de la consulta con los tickets entre las fechas indicadas
    query = db.query(Ticket).filter(
        Ticket.created_at >= initial_date,
        Ticket.created_at <= final_date
    )

    # Agregar filtros opcionales si se proporcionan
    if machine_id:
        query = query.filter(Ticket.machine_id == machine_id)
    if user_id:
        query = query.filter(Ticket.created_by == user_id)
    if assigne_id:
        query = query.filter(Ticket.assigned_to == assigne_id)

 
    # Ejecutar la consulta y obtener los resultados
    tickets = query.all()
    
    ticket_list = [ticket.to_dict() for ticket in tickets]
    #print(ticket_list[0])

    data ={
        "generationDate": datetime.now().strftime("%Y-%m-%d"),
        "startDate": initial_date.strftime("%Y-%m-%d"),
        "endDate": final_date.strftime("%Y-%m-%d"),
        "logoUrl": "https://miempresa.com/logo.png",
        "tickets": ticket_list
    }
    
    try:
        # Llamar al microservicio de Express
        
        ruta = get_route_pdf()
        
        if "railway.internal" in ruta:
            ruta = f"http://{ruta}/generar-pdf"
        else:
            ruta = f"https://{ruta}/generar-pdf"
        
        print(ruta)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(ruta, json=data)
            
        # Verificar si la respuesta fue exitosa
        if response.status_code == 200:
            # Devolver el PDF como respuesta usando StreamingResponse
            pdf_stream = io.BytesIO(response.content)
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Disposition': 'attachment; filename=reporte.pdf',  
            }
            return StreamingResponse(pdf_stream, media_type="application/pdf", headers=headers)
        else:
            raise HTTPException(status_code=response.status_code, detail="Error al generar el PDF")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
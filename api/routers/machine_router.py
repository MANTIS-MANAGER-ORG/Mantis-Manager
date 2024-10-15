from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from config.db import get_db
from models.machine_model import Machine
from schemas.machine_schema import (
    MachineUpdate,
    MachineData,
    MachineActionResponse,
    MachineList,
)

bearer_scheme = HTTPBearer()

# Crear un router para las máquinas
machine_router = APIRouter(tags=["Maquinas"], prefix="/machines")

# Crear una máquina (POST)
@machine_router.post(
    "/machine",
    summary="Crear una nueva máquina",
    description="""El jefe de mantenmiento (rol requerido) podrá crear una nueva máquina.}
        El ID de la máquina debe ser alfanumérico y tener máximo 3 caracteres.
        La acción debe ser una de las siguientes: tejer, teñir, urdir, fijar.""",
    response_description="Datos de la máquina creada", 
    response_model=MachineActionResponse
)
async def create_machine(
    req :Request,
    machine: MachineData = None, 
    db: Session = Depends(get_db), 
    dependencies = Depends(bearer_scheme),
):
    """
    El jefe de mantenimiento podrá crear una nueva máquina.
    
    El ID de la máquina debe ser alfanumérico y tener máximo 3 caracteres.
    La acción debe ser una de las siguientes: tejer, teñir, urdir, fijar.
    """
    user = req.state.user
    if user.get("scopes") != 4:
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")
    
    existing_machine_by_id = db.query(Machine).filter(Machine.id == machine.id).first()
    if existing_machine_by_id:
        raise HTTPException(status_code=400, detail="La máquina ya existe con este ID")

    # Verificar si el serial ya existe
    existing_machine_by_serial = db.query(Machine).filter(Machine.serial == machine.serial).first()
    if existing_machine_by_serial:
        raise HTTPException(status_code=400, detail="La máquina ya existe con este serial")

    new_machine = Machine(  
        id=machine.id,
        type=machine.type,
        brand=machine.brand,
        model=machine.model,
        serial=machine.serial,
        description=machine.description,
        action=machine.action
    )
    
    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    
    response = MachineActionResponse(detail="Máquina creada correctamente")
    
    return response


# Obtener todas las máquinas (GET)
@machine_router.get(
    "/machines", 
    summary="Obtener todas las máquinas",
    description="El jefe de mantenimiento (rol requerido) podrá obtener todas las máquinas registradas.",
    response_model=MachineList
)
async def get_all_machines(
    db: Session = Depends(get_db), 
    dependencies=Depends(bearer_scheme)
):
    """
    El jefe de mantenimiento podrá obtener todas las máquinas registradas.
    Retornando una lista con las maquinas existentes
    """
    machines = db.query(Machine).all()

    # Convertir cada máquina a un modelo Pydantic
    machine_list = [MachineData(
        id=machine.id,
        type=machine.type,
        brand=machine.brand,
        model=machine.model,
        serial=machine.serial,
        description=machine.description,
        action=machine.action
    ) for machine in machines]

    return MachineList(machines=machine_list)


# Obtener una máquina por ID (GET)
@machine_router.get(
    "/machine/{machine_id}", 
    summary="Obtener una máquina por ID",
    description="Los usuarios podran obtener una máquina por su ID.",
    response_model=MachineData
)
async def get_machine(
    machine_id: str = Path(...,description="ID de la maquina", min_length=1, max_length=3),
    db: Session = Depends(get_db), 
    dependencies=Depends(bearer_scheme)
):
    """
    Obtiene una máquina por su ID. Se retorna la información de la maquina
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    
    response = MachineData(
        id=machine.id,
        type=machine.type,
        brand=machine.brand,
        model=machine.model,
        serial=machine.serial,
        description=machine.description,
        action=machine.action
    )
    
    return response


@machine_router.patch(
    "/machine/{machine_id}",
    summary="Actualizar una máquina por su ID.",
    description="Actualizar una máquina por su ID.",
    response_model=MachineActionResponse
)
async def update_machine(
    machine_id: str = Path(..., description="ID de la máquina", min_length=1, max_length=3),
    machine_data: MachineUpdate = None, 
    db: Session = Depends(get_db),
    dependencies = Depends(bearer_scheme)
):
    """
    Actualiza una máquina existente. Retorna un mensaje de exito
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    
    # Actualizar los campos solo si se proporcionan
    for key, value in machine_data.model_dump(exclude_unset=True).items():
        setattr(machine, key, value)
    
    db.commit()
    db.refresh(machine)
    
    return MachineActionResponse(detail="Se ha actualizado con exito")

# Eliminar una máquina (DELETE)
@machine_router.delete(
    "/machine/{machine_id}", 
    summary="Eliminar una maquina por su id",
    description="El jefe de mantenimiento (rol requerido) elimina una máquina por su ID.",
    response_model=MachineActionResponse
)
async def delete_machine(
    req :Request,
    machine_id: str = Path(..., description="ID de la máquina", min_length=1, max_length=3),
    db: Session = Depends(get_db), 
    dependencies=Depends(bearer_scheme),
):
    """
    El jefe de mantenimiento elimina una máquina por su ID. Retorna un mensaje de exito
    """
    
    user = req.state.user
    if user.get("scopes") != 4:
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")
    
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    
    db.delete(machine)
    db.commit()
    
    return MachineActionResponse(detail="Máquina eliminada correctamente")
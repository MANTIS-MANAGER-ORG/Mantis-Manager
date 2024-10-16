import os

environment = os.getenv('ENVIRONMENT', 'production')

if environment == 'development':
    from dotenv import load_dotenv
    # Cargar las variables del archivo .env
    load_dotenv()
    def get_database_url() -> str:
        # Obtiene la URL de la base de datos
        base_dir = os.getenv('MYSQL_URL', 'test.db')

        # Si la base de datos es de prueba
        if base_dir == 'test.db':
        # Construye la URL de la base de datos    
            ruta = os.path.join('test.db')
            if not os.path.exists(ruta):
                ruta = os.path.join('config/', 'test.db')

            database_url = f"sqlite:///{ruta.replace('\\', '/')}"
            return database_url
        else:
            # Si la base de datos es de producción
            base_dir.replace('mysql://', 'mysql+pymysql://')
            return base_dir
else:
    def get_database_url() -> str:
        # Obtiene la URL de la base de datos
        base_dir = os.getenv('MYSQL_URL')

        # Si la base de datos es de producción
        base_dir = base_dir.replace('mysql://', 'mysql+pymysql://')
        return base_dir
    
    
def get_secret_key() -> str:
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("problema con el JWT.")
    return secret_key
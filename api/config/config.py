import os
from dotenv import load_dotenv
environment = os.getenv('ENVIRONMENT', 'development')
print(f"Environment: {environment}")

if environment == 'development':
    load_dotenv()
    def get_database_url() -> str:
        # Obtiene la URL de la base de datos
        base_dir = os.getenv('MYSQL_URL', 'test.db')

        # Si la base de datos es de prueba
        if base_dir == 'test.db':
        # Construye la URL de la base de datos    
            ruta = os.path.join('test.db')
            if not os.path.exists(ruta):
                ruta = os.path.join('config', 'test.db')
            
            database_url = f"sqlite:///{ruta}"
            return database_url
        else:
            # Si la base de datos es de producción
            base_dir.replace('mysql://', 'mysql+pymysql://')
            return base_dir
        
    def get_secret_key() -> str:
        secret_key = os.getenv('SECRET_KEY')
        if not secret_key:
            raise ValueError("problema con el JWT.")
        return secret_key
    
    def get_cloudinary_info() -> dict:
        cloudinary_info = {
            'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME'),
            'api_key': os.getenv('CLOUDINARY_API_KEY'),
            'api_secret': os.getenv('CLOUDINARY_API_SECRET')
        }
        return cloudinary_info
    def get_route_pdf() -> str:
        return os.getenv('ROUTE_MICROSERVICE_PDF')
    
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
    
    def get_cloudinary_info() -> dict:
        cloudinary_info = {
            'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME'),
            'api_key': os.getenv('CLOUDINARY_API_KEY'),
            'api_secret': os.getenv('CLOUDINARY_API_SECRET')
        }
        return cloudinary_info
    
    def get_route_pdf() -> str:
        return os.getenv('ROUTE_MICROSERVICE_PDF')
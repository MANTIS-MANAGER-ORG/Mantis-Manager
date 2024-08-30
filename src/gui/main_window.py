from gui.ticket_view import ticket_interface
from gui.user_management_view import create_user


def main():
    usuario_logueado = None
    while True:
        print("\n--- Menú Principal ---")
        print("1. Gestión de Tickets")
        print("2. Gestión de Usuarios")
        print("3. Salir")
        
        choice = input("Seleccione una opción: ")
        if choice == '1':
            ticket_interface()
        elif choice == '2':
            create_user()
        elif choice == '3':
            print("Saliendo del sistema.")
            break
        else:
            print("Opción no válida. Intente nuevamente.")
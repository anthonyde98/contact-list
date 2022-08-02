import { App } from "@capacitor/app";

export const EMPTY = "";

export const GLOBAL = {
    fingerprint: {
        cancelBtnComponent: "Cancelar",
        descriptionComponent: "Use su huella digital para acceder.",
        titleComponent: "Acceso biometrico",
        backUpBtn: "Usar backup",
        errorCode: {
            bioDismiss: -108,
            pinPatternDismiss: -109,
            lockedOut: -111
        }
    },
    events: {
        backBtnHandler: "ionBackButton",
        click: "click"
    },
    btnAccions: {
        call: "llamar",
        detail: "detalle",
        delete: "borrar"
    },
    customAlerts: {
        error: "custom-alert-danger",
        warning: "custom-alert-warning",
        info: "custom-alert-info",
        success: "custom-alert-success"
    },
    exitFunction: () => App.exitApp() 
}

export const GESTURES = {
    config: {
        elements: {
            slide: "slide",
            shake: "shake",
            contact: {
                tap: "contact-tap",
                doubleTap: "contact-dtap"
            },
            pointer: {
                tap: "pointer-tap",
                doubleTap: "pointer-dtap"
            }
        },
        animations: {
            slide: "slide 2s",
            shake: "shakeX 0.82s cubic-bezier(.36,.07,.19,.97) both",
            contact: {
                tap: "fadeOutUp 1s 0.8s",
                doubleTap: "zoomOut 1s 0.8s"
            },
            pointer: {
                tap: "fadeIn 3s",
                doubleTap: "flash 1s"
            }
        },
        otro: "justify-content: start"
    },
    list: {
        principal: {
            name: "DrawX",
            transition: ".5s ease-out",
            animation: {
                detail: "fadeOutUp 0.5s",
                setContact: "zoomOut 0.8s",
                delete: "fadeOutRight 0.5s"
            }
        }
    }
}

export const KEYS = {
    fingerPrint: "configFinger",
    saveContactos: "saveContactos",
    editContactos: "editContactos",
    deleteContactos: "deleteContactos",
    dataContactos: "dataContactos",
    tokenGroup: "tokenGroup",
    generatedDataIds: "generatedDataIds"
}

export const STATES = {
    error: {
        exact: "error",
        result: "danger"
    },
    success: {
        exact: "success"
    },
    warning: {
        exact: "warning"
    },
    info: {
        exact: "info",
        result: "primary"
    }
}

export const COLORS = {
    grey: {
        light: "rgba(206, 206, 206, 0.600)",
        dark: "rgba(86, 101, 115, 0.600)"
    },
    red: {
        light: "rgba(255, 0, 0, 0.600)",
        dark: "rgba(210, 4, 45, 0.600)"
    },
    orange: "rgba(255, 87, 51, 0.600)",
    blue: {
        light: "rgba(100, 149, 237, 0.600)",
        dark: "rgba(65, 105, 225, 0.600)"
    },
    green: {
        light: "rgba(0, 163, 108, 0.600)",
        dark: "rgba(0, 128, 0, 0.600)"
    },
    yellow: "rgba(255, 192, 0, 0.600)",
    pink: "rgba(255, 105, 180, 0.600)",
    purple: "rgba(136, 78, 160, 0.600)"
}

export const MESSAGES = {
    error: {
        mannyAttends: {
            title: "Demasiados intentos",
            text: "Se realizó demasiados intentos fallidos. Intente de nuevo unos minutos despues. Si el sensor no esta funcionando, entre mediante otro metodo y desactive la opción de acceso biometrico.",
        },
        incorrectFormat: { 
            title: "Formato incorrecto",
            text: "El código proporcionado no es un código QR" 
        },
        incorrectCode: {
            title: "Código incorrecto",
            text: "El código proporcionado no es valido"
        },
        couldntGetContactInformation: "Hubo un error al obtener la información de este contacto",
        errorSettingToken: "Hubo un error al configurar el token de la aplicacion.",
        errorSettingDataId: "Hubo un error al configurando los ids generados.",
        errorRecoveringContact: "Hubo un error al intentar recuperar el contacto",
        errorAddingContact: "Error al agregar contacto",
        errorEditingContact: "Error al editar contacto",
        title: "Error"
    },
    warning: {
        needInternet: "Se necesita internet para realizar esta tarea",
    },
    info: {
        wannaRecoverContact: "¿Quieres recuperar el contacto?",
        wannaCall: "¿Quieres llamar a este número?",
        wannaMail: "¿Quieres enviarle un correo?",
        textCopied: "Texto copiado al portapapeles",
        needInternetToInit: {
            title: "Autenticación",
            text: "Se necesita internet al iniciar por primera vez la aplicación o luego de haber limpiado los datos."
        },
    },
    success: {
        deviceDeleted: "Dispositivo eliminado",
        deviceAdded: "Dispositivo agregado con exito",
        contactAddedOffline: "Contacto agregado offline",
        contactAddedOnline: "Contacto agregado",
        contactEditedOffline: "Contacto editado offline",
        contactEditedOnline: "Contacto editado",
    }
}

export const INFO = {
    contacto: {
        contacto: "contacto",
        nombre: "nombre",
        relacion: "relacion",
        numeros: {
            plural: "numeros",
            singular: "numero"
        },
        color: "color",
        descripcion: "descripcion",
        correo: "correo",
        relaciones: {
            familiar: {
                key: 1,
                value: "Familiar",
            },
            amistad: {
                key: 2,
                value: "Amistad",
            },
            conocido: {
                key: 3,
                value: "Conocido",
            },
            trabajo: {
                key: 4,
                value: "Trabajo",
            },
            otro: {
                key: 5,
                value: "Otro"
            },
        }
    },
    device: {
        usuario: "usuario",
        principalDeviceName: "principal",
        qrFormatCode: "QR_CODE",
        codigo: "codigo",
        nombre: "nombre",
        tipo: "tipo",
        plataforma: "plataforma",
        navegador: "navegador",
        uuidVersion: 4
    }
}

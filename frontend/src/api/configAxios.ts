import Cookies from "js-cookie";
import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * ClientHTTP class is responsible for creating an HTTP client
 * using the Axios library. It allows for an optional interceptor
 * that can modify the request configuration.
 */
class ClientHTTP {
    private api: AxiosInstance;
    private applyContentAppJson: boolean;

    /**
     * Constructs an instance of the ClientHTTP class.
     * @param {boolean} applyContentAppJson - Determines the `Content-Type` header.
     */
    constructor(applyContentAppJson: boolean) {
        this.applyContentAppJson = applyContentAppJson;
        this.api = axios.create({
            baseURL: import.meta.env.VITE_PUBLIC_API_URL,
            headers: {
                "Content-Type": this.applyContentAppJson
                    ? "application/json"
                    : "multipart/form-data",
            },
        });

        // Interceptor para actualizar siempre el token antes de cada solicitud
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = Cookies.get("token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => {
                // Manejo de errores en la solicitud (si es necesario)
                return Promise.reject(error);
            }
        );

        // Interceptor para manejar respuestas de error, como problemas de autenticación
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (error.response && error.response.status === 401) {
                    Cookies.remove("token"); // Borrar el token
                    window.location.href = "/"; // Redirigir al home público
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Get the created Axios instance.
     * @returns {AxiosInstance} - The created Axios instance for making HTTP requests.
     */
    getApi(): AxiosInstance {
        return this.api;
    }
}

// Crear las instancias del cliente HTTP
const clientHTTP = new ClientHTTP(true).getApi();
const clientHTTPMultiPlatform = new ClientHTTP(false).getApi();

export { clientHTTP, clientHTTPMultiPlatform };

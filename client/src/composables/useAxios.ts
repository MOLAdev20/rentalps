import Axios from "axios";
import { useRouter } from "vue-router";

export function useAxios() {
  const base_url = import.meta.env.VITE_API_URL;

  const redirectToLogin = () => {
    localStorage.removeItem("token");
    router.push({
      name: "login",
      query: {
        alert: "warning",
        message: "Login untuk melanjutkan!",
      },
    });
  };

  // Interceptor 1: Nempelin token otomatis di setiap request
  Axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  });

  // Interceptor 2: Nangkep error 401 otomatis & tendang ke login
  Axios.interceptors.response.use(
    (response) => response,
    async (err) => {
      if (err.response.status === 401) {
        console.log(err.response.data.message);
        if (err.response.data.message === "jwt expired") {
          try {
            const refreshTokenResponse = await Axios.post(
              `${base_url}/auth/refresh-token`,
              {
                user_id: 1,
              },
            );
            localStorage.setItem(
              "token",
              `Bearer ${refreshTokenResponse.data.token}`,
            );

            return Axios.request(err.config);
          } catch (err: any) {
            if (err.response.status === 500) {
              console.log("refresh token endpoint internal server error");
            }
            redirectToLogin();
          }
        }
        router.push({
          name: "login",
          query: {
            alert: "warning",
            message: "Login untuk melanjutkan!",
          },
        });
      }
      return Promise.reject(err);
    },
  );

  const router = useRouter();
  const http = {
    get: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.get(`${base_url}/${url}`);
        callback(response);
      } catch (err: any) {
        errCallback(err);
      }
    },

    getWithParams: async (
      url: string,
      params: any,
      callback: any,
      errCallback: any,
    ) => {
      try {
        const response = await Axios.get(`${base_url}/${url}`, {
          params,
        });
        callback(response);
      } catch (err: any) {
        errCallback(err);
      }
    },

    post: async (url: string, data: any, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.post(`${base_url}/${url}`, data);
        callback(response);
      } catch (err: any) {
        errCallback(err);
      }
    },

    delete: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.delete(`${base_url}/${url}`);
        callback(response);
      } catch (err: any) {
        errCallback(err);
      }
    },

    patch: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.patch(`${base_url}/${url}`);
        callback(response);
      } catch (err: any) {
        errCallback(err);
      }
    },
  };

  return http;
}

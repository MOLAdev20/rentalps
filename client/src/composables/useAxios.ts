import Axios from "axios";
import { useRouter } from "vue-router";

const base_url = import.meta.env.VITE_API_URL;

export function useAxios() {
  // Pindahin ke sini biar kepanggil pas setup context aktif
  const router = useRouter();

  const http = {
    get: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.get(`${base_url}/${url}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });

        callback(response);
      } catch (err: any) {
        errCallback(err);

        if (err.response.status === 401 || err.status === 401) {
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: {
              message: "Login untuk melanjutkan!",
            },
          });
        }
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
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
          params,
        });

        callback(response);
      } catch (err: any) {
        if (err.response.status === 401 || err.status === 401) {
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: {
              message: "Login untuk melanjutkan!",
            },
          });
        }

        errCallback(err);
      }
    },

    post: async (url: string, data: any, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.post(`${base_url}/${url}`, data, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });

        callback(response);
      } catch (err: any) {
        if (err.response.status === 401 || err.status === 401) {
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: {
              message: "Login untuk melanjutkan!",
            },
          });
        }

        errCallback(err);
      }
    },

    delete: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.get(`${base_url}/${url}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });

        callback(response);
      } catch (err: any) {
        errCallback(err);

        if (err.response.status === 401 || err.status === 401) {
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: {
              message: "Login untuk melanjutkan!",
            },
          });
        }
      }
    },

    patch: async (url: string, callback: any, errCallback?: any) => {
      try {
        const response = await Axios.get(`${base_url}/${url}`, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });

        callback(response);
      } catch (err: any) {
        errCallback(err);

        if (err.response.status === 401 || err.status === 401) {
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: {
              message: "Login untuk melanjutkan!",
            },
          });
        }
      }
    },
  };

  return http;
}

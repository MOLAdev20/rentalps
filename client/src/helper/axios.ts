import Axios from "axios";
import router from "../router/index.ts";

const base_url = import.meta.env.VITE_API_URL;

const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
    const base64Url = raw.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.id ? Number(parsed.id) : null;
  } catch {
    return null;
  }
};

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
    if (err.response?.status === 401) {
      console.log(err.response.data?.message);
      if (err.response.data?.message === "jwt expired") {
        const userId = getUserIdFromToken();
        if (!userId) {
          redirectToLogin();
          return Promise.reject(err);
        }

        try {
          const refreshTokenResponse = await Axios.post(
            `${base_url}/auth/refresh-token`,
            {
              user_id: userId,
              user_agent: window.navigator?.userAgent || "Browser",
            },
          );
          const newToken = `Bearer ${refreshTokenResponse.data.token}`;
          localStorage.setItem("token", newToken);

          if (err.config) {
            err.config.headers.Authorization = newToken;
            return Axios.request(err.config);
          }
        } catch (err: any) {
          if (err.response?.status === 500) {
            console.log("refresh token endpoint internal server error");
          }
          redirectToLogin();
          return Promise.reject(err);
        }
      }
      redirectToLogin();
    }
    return Promise.reject(err);
  },
);

export default {
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

  patchWithData: async (
    url: string,
    data: any,
    callback: any,
    errCallback?: any,
  ) => {
    try {
      const response = await Axios.patch(`${base_url}/${url}`, data);
      callback(response);
    } catch (err: any) {
      errCallback(err);
    }
  },

  logout: async () => {
    try {
      await Axios.post(`${base_url}/auth/logout`);
    } catch {
      // abaikan error, tetap logout dari client
    } finally {
      localStorage.removeItem("token");
      router.push({ name: "login" });
    }
  },
};

"use client";
import { type AuthProvider } from "@refinedev/core";
import { addUserToOrganization } from "@services/keycloak/user.service";
import { RoleOptiosn } from "@utils/util.constants";
import axios from "axios";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { decode } from "punycode";
const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
const realmId = process.env.NEXT_PUBLIC_KEYCLOAK_REALM_ID;
const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET;

const getCurrentUser = () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const user = jwt.decode(accessToken as string);
    return user;
  }
  return null;
};

export const authProvider: AuthProvider = {
  login: async ({ email, password, organizationId }) => {
    const response = await axios.post(
      `${keycloakUrl}/realms/${realmId}/protocol/openid-connect/token`,
      {
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "email openid",
        username: email,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const userId = jwt.decode(response.data.access_token)?.sub as string;
    if (organizationId) {
      await addUserToOrganization(
        userId,
        organizationId,
        response.data.access_token
      );
    }

    if (response.status === 200) {
      localStorage.setItem("accessToken", response.data.access_token);
      return {
        success: true,
        redirectTo: "/dashboard",
      };
    } else {
      return {
        success: false,
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("accessToken");

    return {
      success: true,
      redirectTo: "/auth/login",
    };
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return {
      error,
    };
  },
  check: async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const pathName = window.location.pathname;
    const role = localStorage.getItem("signupRole");
    if (pathName.includes("registrations") && queryParams.get("token")) {
      const key = queryParams.get("token") as string;
      const decodedTokenData = jwtDecode<any>(key);
      const tokenType = decodedTokenData.typ;
      localStorage.setItem("signupRole", RoleOptiosn.INDIVIDUAL);
      return {
        authenticated: false,
        redirectTo: `/auth/signup/setup-account?organizationId=${decodedTokenData.org_id}&key=${key}`,
      };
    }
    if (
      queryParams.get("key") &&
      pathName.includes("login-actions/action-token")
    ) {
      const key = queryParams.get("key") as string;
      const decodedTokenData = jwtDecode<any>(key);
      const tokenType = decodedTokenData.typ;
      if (tokenType == "verify-email") {
        return {
          authenticated: false,
          redirectTo: `/auth/signup/complete-profile?role=${role}&key=${key}`,
        };
      } else if (tokenType == "ORGIVT") {
        localStorage.setItem("signupRole", RoleOptiosn.INDIVIDUAL);
        return {
          authenticated: false,
          redirectTo: `/auth/organization-join?organizationId=${decodedTokenData.org_id}&key=${key}`,
        };
      } else if (tokenType == "execute-actions") {
        return {
          authenticated: false,
          redirectTo: `/auth/forgot-password/reset-password?userId=${decodedTokenData.sub}&key=${key}`,
        }
      }
    }
    const user = getCurrentUser();
    if (user) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      redirectTo: "/auth/login",
    };
  },
  getPermissions: async () => {
    return null;
  },
  getIdentity: async () => {
    return getCurrentUser();
  },
};

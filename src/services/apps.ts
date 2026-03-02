import type { App, Response, TaskStatus } from "@/interfaces";

import apiClient from "@/plugins/axios";

class AppsService {
  async getApps(): Promise<Response<App>> {
    const response = await apiClient.get("/apps/apps/");
    return response.data;
  }

  async getAppsByProject(projectId: string): Promise<Response<App>> {
    const response = await apiClient.get("/apps/apps/", {
      params: { project: projectId },
    });
    return response.data;
  }

  async getApp(id: string): Promise<App> {
    const response = await apiClient.get(`/apps/apps/${id}/`);
    return response.data;
  }

  async createApp(data: App): Promise<App> {
    const response = await apiClient.post("/apps/apps/", data);
    return response.data;
  }

  async updateApp(id: string, data: App): Promise<App> {
    const response = await apiClient.put(`/apps/apps/${id}/`, data);
    return response.data;
  }

  async patchApp(id: string, data: Partial<App>): Promise<App> {
    const response = await apiClient.patch(`/apps/apps/${id}/`, data);
    return response.data;
  }

  async deleteApp(id: string): Promise<void> {
    await apiClient.delete(`/apps/apps/${id}/`);
  }

  async getAppStatus(id: string): Promise<TaskStatus> {
    const response = await apiClient.get(`/apps/apps/${id}/get_app_status/`);
    return response.data;
  }

  async startApp(id: string): Promise<App> {
    const response = await apiClient.post(`/apps/apps/${id}/start/`);
    return response.data;
  }

  async stopApp(id: string): Promise<App> {
    const response = await apiClient.post(`/apps/apps/${id}/stop/`);
    return response.data;
  }

  async restartApp(id: string): Promise<App> {
    const response = await apiClient.post(`/apps/apps/${id}/restart/`);
    return response.data;
  }

  async runCommand(
    id: string,
    command: string,
  ): Promise<{ status: string; message: string; task_id: string }> {
    const response = await apiClient.post(`/apps/apps/${id}/run_command/`, {
      command,
    });
    return response.data;
  }

  async getAllowedCommands(
    id: string,
  ): Promise<{ commands: string[]; prefixes: string[] }> {
    const response = await apiClient.get(`/apps/apps/${id}/allowed_commands/`);
    return response.data;
  }

  async checkName(
    name: string,
  ): Promise<{ available: boolean; name?: string; reason?: string }> {
    const response = await apiClient.get("/apps/apps/check_name/", {
      params: { name },
    });
    return response.data;
  }
}

export default new AppsService();

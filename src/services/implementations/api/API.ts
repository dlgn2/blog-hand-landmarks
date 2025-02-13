import { UserService } from "../services/UserService";
import { FetchAdapter } from "./FetchAdapter";

//export const BACKEND_URL = 'https://api.neurastudios.co/api/';
export const BACKEND_URL =
  "https://tsl-fastapi-backend-hbeqbva5c3aabjcn.canadacentral-01.azurewebsites.net";

export class API {
  public user: UserService;

  constructor() {
    const fetchAdapterLocal = new FetchAdapter(BACKEND_URL);
    this.user = new UserService(fetchAdapterLocal);
  }
}

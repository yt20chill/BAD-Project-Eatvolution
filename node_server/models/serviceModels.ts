export interface AuthServiceHelper {
  login(username: string, password: string): Promise<boolean>;
  signUp(username: string, password: string): Promise<number>;
}

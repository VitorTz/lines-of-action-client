import { AuthAPI } from "./authApi";
import { ImageAPI } from "./imageApi";
import { UserAPI } from "./userApi";



class LinesApi {

  readonly auth = new AuthAPI();
  readonly user = new UserAPI();
  readonly images = new ImageAPI();

}


export const linesApi = new LinesApi();
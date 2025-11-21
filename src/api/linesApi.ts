import { AuthAPI } from "./authApi";
import { GameApi } from "./gameApi";
import { ImageAPI } from "./imageApi";
import { MetricsApi } from "./metricsApi";
import { UserAPI } from "./userApi";



class LinesApi {

  readonly auth = new AuthAPI();
  readonly user = new UserAPI();
  readonly images = new ImageAPI();
  readonly game = new GameApi();
  readonly metrics = new MetricsApi();

}


export const linesApi = new LinesApi();
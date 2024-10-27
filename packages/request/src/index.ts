import { CreateAxiosOptions, AxiosTransfrom } from "./AxiosTransform";
import { deepMerge, clone } from "@monorepo/utils";
import { Axios } from "./Axios";
import type { AxiosResponse } from "axios";
import type { RequestOptions, RequestResult } from "@monorepo/types";

/**
 * @description 对数据格式进行处理，以及对拦截器进行初始化
 */
const transform: AxiosTransfrom = {
  /**
   * @description: 处理请求数据。如果数据不是预期格式，可直接抛出错误
   */
  transformRequestHook: (
    res: AxiosResponse<RequestResult>,
    options: RequestOptions
  ) => {
    const { isTransformResponse, isReturnNativeResponse } = options;
    if (isReturnNativeResponse) {
      return res;
    }
    if (!isTransformResponse) {
      return res.data;
    }
    const { data } = res;
    if (!data) {
      throw new Error("响应中没有可用data");
    }
    const { code, result, message } = data;
    if (result) {
      return result;
    } else {
      throw new Error("响应没有Result");
    }
  },
  /**
   * @description: 请求之前处理config
   */
  beforeRequestHook: (config, options) => {
    return config;
  },
  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    return config;
  },
  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },
  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {},
};

export const createAxios = (opt?: Partial<CreateAxiosOptions>) => {
  return new Axios(
    deepMerge(
      {
        authenticationScheme: "",
        timeout: 10 * 1000,
        // 基础接口地址
        // baseURL: '',

        headers: { "Content-Type": "text/javascript" },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: clone(transform),
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: "message",
          // 接口地址
          apiUrl: "",
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
        },
      },
      opt || {}
    )
  );
};

export let request = createAxios();

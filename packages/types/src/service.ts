export type ErrorMessageMode = "none" | "modal" | "message" | undefined;

export interface RequestOptions {
  //是否将参数拼接到url
  joinParamsUrl?: boolean;
  //是否格式化请求时间
  formatDate?: boolean;
  //是否处理请求结果
  isTransformResponse?: boolean;
  //接口地址
  apiUrl?: string | (() => string);
  //错误提示类型
  errorMessageMode?: ErrorMessageMode;
  //是否加入时间戳
  joinTime?: boolean;
  //是否忽略取消请求
  ignoreCancelToken?: boolean;
  //是否在请求头中加入token
  withToken?: boolean;
  //是否直接返回原生响应
  isReturnNativeResponse?: boolean;
}

export interface RequestResult<T = any> {
  code: number;
  type: "success" | "error" | "warning";
  message: string;
  result: T;
}

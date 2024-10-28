import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
} from 'axios'
import axiosRetry from 'axios-retry'
import { CreateAxiosOptions } from './AxiosTransform.ts'
import { isFunction, cloneDeep } from '@monorepo/utils'
import { RequestOptions, RequestResult } from '@monorepo/types'

export class Axios {
  private axiosInstance: AxiosInstance
  private options: CreateAxiosOptions
  constructor(options: CreateAxiosOptions) {
    this.options = options
    this.axiosInstance = axios.create(options)
    axiosRetry(this.axiosInstance)
    this.setupInterceptors()
  }

  /**
   * @description 创建axios实例
   * @param {CreateAxiosOptions} config 配置对象
   */
  private createAxios(config: CreateAxiosOptions) {
    this.axiosInstance = axios.create(config)
    axiosRetry(this.axiosInstance)
  }

  /**
   * @description 获取拦截器方法
   * @returns {AxiosTransfrom | undefined} 返回包含拦截器钩子的抽象类的对象
   */
  private getTransfrom() {
    const { transform } = this.options
    return transform
  }

  /**
   * @description 初始化拦截器
   * @returns
   */
  private setupInterceptors() {
    const transform = this.getTransfrom()
    if (!transform) {
      return
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform

    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (requestInterceptors && isFunction(requestInterceptors)) {
          config = requestInterceptors(config, this.options)
        }
        return config
      },
      undefined,
    )

    if (requestInterceptorsCatch && isFunction(requestInterceptorsCatch)) {
      this.axiosInstance.interceptors.request.use(
        undefined,
        requestInterceptorsCatch,
      )
    }

    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res)
      }
      return res
    }, undefined)

    if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch)) {
      this.axiosInstance.interceptors.response.use(
        undefined,
        responseInterceptorsCatch,
      )
    }
  }

  request<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions,
  ): Promise<T> {
    let conf = cloneDeep(config)
    const transform = this.getTransfrom()
    const { requestOptions } = this.options
    const opt: RequestOptions = Object.assign({}, requestOptions, options)
    const { beforeRequestHook, requestCatchHook, transformRequestHook } =
      transform || {}
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt)
    }
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<RequestResult>>(conf)
        .then((res: AxiosResponse<RequestResult>) => {
          if (transformRequestHook && isFunction(transformRequestHook)) {
            try {
              const ret = transformRequestHook(res, opt)
              resolve(ret)
            } catch (err) {
              reject(err || new Error('request error!'))
            }
            return
          }
          resolve(res as unknown as Promise<T>)
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt))
            return
          }
          if (axios.isAxiosError(e)) {
            // rewrite error message from axios in here
          }
          reject(e)
        })
    })
  }

  get<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options)
  }

  post<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options)
  }

  put<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options)
  }

  delete<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options)
  }
}

import URL from 'Common/Types/API/URL';
import Headers from 'Common/Types/API/Headers';
import PositiveNumber from 'Common/Types/PositiveNumber';
import Protocol from 'Common/Types/API/Protocol';
import WebsiteRequest, { WebsiteResponse } from 'Common/Types/WebsiteRequest';
import HTML from 'Common/Types/Html';
import { AxiosError } from 'axios';
import logger from 'CommonServer/Utils/Logger';
import HTTPMethod from 'Common/Types/API/HTTPMethod';
import ObjectID from 'Common/Types/ObjectID';
import Sleep from 'Common/Types/Sleep';

export interface ProbeWebsiteResponse {
    url: URL;
    requestHeaders: Headers;
    isSecure: boolean;
    responseTimeInMS: PositiveNumber;
    statusCode: number | undefined;
    responseBody: HTML | undefined;
    responseHeaders: Headers | undefined;
    isOnline: boolean;
    failureCause: string;
}

export default class WebsiteMonitor {
    // burn domain names into the code to see if this probe is online.
    public static async isProbeOnline(): Promise<boolean> {
        if (
            (
                await WebsiteMonitor.ping(
                    URL.fromString('https://google.com'),
                    {
                        isHeadRequest: true,
                        isOnlineCheckRequest: true,
                    }
                )
            )?.isOnline
        ) {
            return true;
        } else if (
            (
                await WebsiteMonitor.ping(
                    URL.fromString('https://facebook.com'),
                    {
                        isHeadRequest: true,
                        isOnlineCheckRequest: true,
                    }
                )
            )?.isOnline
        ) {
            return true;
        } else if (
            (
                await WebsiteMonitor.ping(
                    URL.fromString('https://microsoft.com'),
                    {
                        isHeadRequest: true,
                        isOnlineCheckRequest: true,
                    }
                )
            )?.isOnline
        ) {
            return true;
        } else if (
            (
                await WebsiteMonitor.ping(
                    URL.fromString('https://youtube.com'),
                    {
                        isHeadRequest: true,
                        isOnlineCheckRequest: true,
                    }
                )
            )?.isOnline
        ) {
            return true;
        } else if (
            (
                await WebsiteMonitor.ping(URL.fromString('https://apple.com'), {
                    isHeadRequest: true,
                    isOnlineCheckRequest: true,
                })
            )?.isOnline
        ) {
            return true;
        }

        return false;
    }

    public static async ping(
        url: URL,
        options: {
            retry?: number | undefined;
            isHeadRequest?: boolean | undefined;
            currentRetryCount?: number | undefined;
            monitorId?: ObjectID | undefined;
            isOnlineCheckRequest?: boolean | undefined;
        }
    ): Promise<ProbeWebsiteResponse | null> {
        let requestType: HTTPMethod = HTTPMethod.GET;

        if (options.isHeadRequest) {
            requestType = HTTPMethod.HEAD;
        }

        try {
            logger.info(
                `Website Monitor - Pinging ${options.monitorId?.toString()} ${requestType} ${url.toString()} - Retry: ${
                    options.currentRetryCount
                }`
            );

            let startTime: [number, number] = process.hrtime();
            let result: WebsiteResponse = await WebsiteRequest.fetch(url, {
                isHeadRequest: options.isHeadRequest,
            });

            if (
                result.responseStatusCode >= 400 &&
                result.responseStatusCode < 600 &&
                requestType === HTTPMethod.HEAD
            ) {
                startTime = process.hrtime();
                result = await WebsiteRequest.fetch(url, {
                    isHeadRequest: false,
                });
            }

            const endTime: [number, number] = process.hrtime(startTime);
            const responseTimeInMS: PositiveNumber = new PositiveNumber(
                (endTime[0] * 1000000000 + endTime[1]) / 1000000
            );

            const probeWebsiteResponse: ProbeWebsiteResponse = {
                url: url,
                requestHeaders: {},
                isOnline: true,
                isSecure: url.protocol === Protocol.HTTPS,
                responseTimeInMS: responseTimeInMS,
                statusCode: result.responseStatusCode,
                responseBody: result.responseBody,
                responseHeaders: result.responseHeaders,
                failureCause: '',
            };

            logger.info(
                `Website Monitor - Pinging ${options.monitorId?.toString()} ${requestType} ${url.toString()} Success - Response: ${JSON.stringify(
                    probeWebsiteResponse
                )}`
            );

            return probeWebsiteResponse;
        } catch (err: unknown) {
            if (!options) {
                options = {};
            }

            if (!options.currentRetryCount) {
                options.currentRetryCount = 0; // default value
            }

            if (options.currentRetryCount < (options.retry || 5)) {
                options.currentRetryCount++;
                await Sleep.sleep(1000);
                return await this.ping(url, options);
            }

            let probeWebsiteResponse: ProbeWebsiteResponse | undefined =
                undefined;

            if (err instanceof AxiosError) {
                probeWebsiteResponse = {
                    url: url,
                    isOnline: Boolean(err.response),
                    requestHeaders: {},
                    isSecure: url.protocol === Protocol.HTTPS,
                    responseTimeInMS: new PositiveNumber(0),
                    statusCode: err.response?.status,
                    responseBody: err.response?.data,
                    responseHeaders: (err.response?.headers as Headers) || {},
                    failureCause: err.message || err.toString(),
                };
            } else {
                probeWebsiteResponse = {
                    url: url,
                    isOnline: false,
                    requestHeaders: {},
                    isSecure: url.protocol === Protocol.HTTPS,
                    responseTimeInMS: new PositiveNumber(0),
                    statusCode: undefined,
                    responseBody: undefined,
                    responseHeaders: undefined,
                    failureCause: (err as Error).toString(),
                };
            }

            // check if timeout exceeded and if yes, return null
            if (
                (err as any).toString().includes('timeout') &&
                (err as any).toString().includes('exceeded')
            ) {
                logger.info(
                    `Website Monitor - Timeout exceeded ${options.monitorId?.toString()} ${requestType} ${url.toString()} - ERROR: ${err}`
                );
                return null;
            }

            if (!options.isOnlineCheckRequest) {
                if (!(await WebsiteMonitor.isProbeOnline())) {
                    logger.error(
                        `Website Monitor - Probe is not online. Cannot ping ${options.monitorId?.toString()} ${requestType} ${url.toString()} - ERROR: ${err}`
                    );
                    return null;
                }
            }

            logger.error(
                `Website Monitor - Pinging ${options.monitorId?.toString()} ${requestType} ${url.toString()} - ERROR: ${err} Response: ${JSON.stringify(
                    probeWebsiteResponse
                )}`
            );

            return probeWebsiteResponse;
        }
    }
}

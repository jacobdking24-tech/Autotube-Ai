// SDK exports these request functions:
//
//   /**
//    * Generate images from text prompts
//    *
//    * Creates one or more images from a text prompt using GPT Image-1 models
//    */
//
//   export function createImageGeneration(opts: CreateImageGenerationData): Promise<{
//     error?: CreateImageGenerationErrors[keyof CreateImageGenerationErrors],
//     data?: CreateImageGenerationResponses[keyof CreateImageGenerationResponses],
//     request: Request,
//     response: Response }>;
//
//   ALIAS: createImageGeneration is equivalent to: import { requestNanoBanana } from '@/sdk/api-clients/68f874c693fecd38dba9b929/requestNanoBanana'
//
// 

export type ClientOptions = {
    baseUrl: 'https://api-production.creao.ai' | (string & {});
};

export type CreateImageGenerationData = {
    body: {
        /**
         * Text description of the desired image. The maximum length is 32,000 characters.
         */
        prompt: string;
    };
    path?: never;
    query?: never;
    url: '/official-api/gen-img';
};

export type CreateImageGenerationErrors = {
    /**
     * Bad request - invalid parameters
     */
    400: unknown;
    /**
     * Unauthorized - invalid or missing token
     */
    401: unknown;
    /**
     * Rate limit exceeded
     */
    429: unknown;
    /**
     * Internal server error
     */
    500: unknown;
};

export type CreateImageGenerationResponses = {
    /**
     * Images successfully generated
     */
    200: {
        /**
         * Unix timestamp (in seconds) when the image was created.
         */
        created?: number;
        /**
         * List of generated images
         */
        data?: Array<{
            /**
             * image url
             */
            url?: string;
        }>;
    };
};

export type CreateImageGenerationResponse = CreateImageGenerationResponses[keyof CreateImageGenerationResponses];

import { createImageGeneration as requestNanoBanana } from './_impl/sdk.gen';

// please read type definitions: src/sdk/api-clients/68f874c693fecd38dba9b929/_impl/types.gen.ts
// to learn about type and default values
export type { CreateImageGenerationData, CreateImageGenerationErrors, CreateImageGenerationResponses } from './_impl/types.gen';

// Type definition of request function:
// async function requestNanoBanana(opts: CreateImageGenerationData): Promise<{
//     error?: CreateImageGenerationErrors[keyof CreateImageGenerationErrors],
//     data?: CreateImageGenerationResponses[keyof CreateImageGenerationResponses],
//     request: Request,
//     response: Response
// }>
export { requestNanoBanana };
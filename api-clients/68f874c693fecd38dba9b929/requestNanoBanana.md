## NanoBanana

Add Google's NanoBanana for text-to-image generation to your app. Enable your app to generate photorealistic images instantly with no setup, accounts, or API keys required.

```typescript
// NanoBanana - id: 68f874c693fecd38dba9b929

// please read type definitions: src/sdk/api-clients/68f874c693fecd38dba9b929/_impl/types.gen.ts
// to learn about type and default values
import type { CreateImageGenerationData, CreateImageGenerationErrors, CreateImageGenerationResponses } from '@/sdk/api-clients/68f874c693fecd38dba9b929/requestNanoBanana';

// Type definition of request function:
// async function requestNanoBanana(opts: CreateImageGenerationData): Promise<{
//     error?: CreateImageGenerationErrors[keyof CreateImageGenerationErrors],
//     data?: CreateImageGenerationResponses[keyof CreateImageGenerationResponses],
//     request: Request,
//     response: Response
// }>
import { requestNanoBanana } from '@/sdk/api-clients/68f874c693fecd38dba9b929/requestNanoBanana';
```
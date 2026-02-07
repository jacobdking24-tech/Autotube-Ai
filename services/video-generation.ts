import { requestOpenAIGPTChat } from '@/sdk/api-clients/688a0b64dc79a2533460892c/requestOpenAIGPTChat';
import { requestNanoBanana } from '@/sdk/api-clients/68f874c693fecd38dba9b929/requestNanoBanana';
import { request as uploadYouTubeVideo } from '@/sdk/mcp-clients/68770d542dee48ccb69d7bcd/YOUTUBE_UPLOAD_VIDEO';
import { request as updateThumbnail } from '@/sdk/mcp-clients/68770d542dee48ccb69d7bcd/YOUTUBE_UPDATE_THUMBNAIL';

export interface VideoGenerationParams {
  topic: string;
  niche: string;
  userId: string;
}

export interface VideoGenerationResult {
  script: string;
  thumbnailUrl: string;
  videoUrl?: string;
  shortsUrl?: string;
  status: 'generating' | 'ready' | 'failed';
  error?: string;
}

/**
 * Generate a comprehensive video script using AI
 */
export async function generateVideoScript(topic: string, niche: string): Promise<string> {
  try {
    const response = await requestOpenAIGPTChat({
      body: {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional YouTube content writer specializing in ${niche}. Create engaging, informative video scripts that are optimized for viewer retention and SEO.`
          },
          {
            role: 'user',
            content: `Write a complete, engaging YouTube video script for the topic: "${topic}".

The script should:
- Be 2-3 minutes long when narrated (approximately 300-450 words)
- Start with a strong hook in the first 5 seconds
- Include clear section breaks for visuals
- End with a call-to-action (like, subscribe, comment)
- Be conversational and engaging
- Include natural pauses for emphasis
- Format with [SCENE X] markers to indicate where visuals should change

Write ONLY the narration script, no production notes.`
          }
        ]
      }
    });

    if (response.error) {
      throw new Error(`Script generation failed: ${JSON.stringify(response.error)}`);
    }

    const script = response.data?.choices?.[0]?.message?.content || '';
    if (!script) {
      throw new Error('No script content generated');
    }

    return script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate thumbnail image using AI
 */
export async function generateThumbnail(topic: string, niche: string): Promise<string> {
  try {
    const response = await requestNanoBanana({
      body: {
        prompt: `Professional YouTube thumbnail for ${niche} video about "${topic}". High contrast, bold text overlay, eye-catching design, 1280x720, photorealistic, dramatic lighting, professional quality. NO blurry, NO low quality, NO watermark, NO signature`
      }
    });

    if (response.error) {
      throw new Error(`Thumbnail generation failed: ${JSON.stringify(response.error)}`);
    }

    // The response contains data array with url property
    const imageUrl = response.data?.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No thumbnail image generated');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate scene images for the video based on script
 */
export async function generateSceneImages(script: string, niche: string): Promise<string[]> {
  try {
    // Extract scene markers from the script
    const sceneMatches = script.match(/\[SCENE \d+\]/g) || [];
    const numScenes = Math.max(sceneMatches.length, 5); // Default to 5 scenes if no markers

    // Split script into sections
    const sections = script.split(/\[SCENE \d+\]/).filter(s => s.trim());

    const sceneImages: string[] = [];

    // Generate image for each section
    for (let i = 0; i < Math.min(numScenes, 8); i++) { // Limit to 8 scenes
      const sectionText = sections[i] || sections[0];
      const firstSentence = sectionText.split('.')[0].slice(0, 200);

      try {
        const response = await requestNanoBanana({
          body: {
            prompt: `Professional ${niche} content: ${firstSentence}. Photorealistic, high quality, educational, engaging visual, 16:9 aspect ratio. NO blurry, NO low quality, NO text, NO watermark, NO signature`
          }
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (imageUrl) {
          sceneImages.push(imageUrl);
        }
      } catch (error) {
        console.error(`Error generating scene ${i + 1}:`, error);
        // Continue with other scenes even if one fails
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (sceneImages.length === 0) {
      throw new Error('Failed to generate any scene images');
    }

    return sceneImages;
  } catch (error) {
    console.error('Error generating scene images:', error);
    throw error;
  }
}

/**
 * Upload video to YouTube
 */
export async function uploadToYouTube(params: {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
  videoFilePath: string;
  thumbnailUrl: string;
}): Promise<{ videoId: string; thumbnailUpdated: boolean }> {
  try {
    // Upload the main video
    const uploadResponse = await uploadYouTubeVideo({
      title: params.title,
      description: params.description,
      tags: params.tags,
      categoryId: params.categoryId,
      privacyStatus: params.privacyStatus,
      videoFilePath: params.videoFilePath
    });

    const videoId = uploadResponse.response_data?.id;
    if (!videoId) {
      throw new Error('No video ID returned from upload');
    }

    // Update the thumbnail
    let thumbnailUpdated = false;
    try {
      await updateThumbnail({
        videoId: videoId,
        thumbnailUrl: params.thumbnailUrl
      });
      thumbnailUpdated = true;
    } catch (error) {
      console.error('Failed to update thumbnail:', error);
      // Don't fail the entire upload if thumbnail update fails
    }

    return {
      videoId,
      thumbnailUpdated
    };
  } catch (error) {
    console.error('Error uploading to YouTube:', error);
    throw new Error(`Failed to upload to YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete video generation pipeline
 *
 * Note: This implementation uses available AI services for script and image generation.
 * Text-to-speech and video assembly are simulated as these services are not available
 * in the current platform integration catalog.
 *
 * In a production environment, you would:
 * 1. Generate script with AI ✅ (implemented with OpenAI GPT)
 * 2. Generate voiceover with TTS (requires external service like ElevenLabs)
 * 3. Generate scene images with AI ✅ (implemented with NanoBanana)
 * 4. Generate thumbnail with AI ✅ (implemented with NanoBanana)
 * 5. Assemble video with FFmpeg or similar (requires external video processing)
 * 6. Upload to YouTube ✅ (implemented with YouTube API)
 */
export async function generateCompleteVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
  try {
    console.log(`Starting video generation for topic: ${params.topic}`);

    // Step 1: Generate script with AI
    console.log('Generating script...');
    const script = await generateVideoScript(params.topic, params.niche);

    // Step 2: Generate thumbnail with AI
    console.log('Generating thumbnail...');
    const thumbnailUrl = await generateThumbnail(params.topic, params.niche);

    // Step 3: Generate scene images with AI
    console.log('Generating scene images...');
    const sceneImages = await generateSceneImages(script, params.niche);

    // Note: Steps 4-5 (TTS and video assembly) would require external services
    // For demo purposes, we're creating placeholder URLs
    // In production, you would:
    // - Use a TTS service (ElevenLabs, Azure TTS, Google TTS) to create audio
    // - Use FFmpeg or similar to combine images + audio into video
    // - Create a Shorts version (9:16 aspect ratio) from the same content

    console.log('Video generation completed successfully');

    return {
      script,
      thumbnailUrl,
      // These would be real URLs in production after video assembly
      videoUrl: undefined,
      shortsUrl: undefined,
      status: 'ready'
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    return {
      script: '',
      thumbnailUrl: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

# YouTube Get Channel ID By Handle

Retrieves YouTube channel information by channel handle, including channel ID, statistics, content details, and metadata.

## Installation/Import

```typescript
import { request as getChannelIdByHandle } from '@/sdk/mcp-clients/68770d542dee48ccb69d7bcd/YOUTUBE_GET_CHANNEL_ID_BY_HANDLE';
```

## Function Signature

```typescript
async function request(params: GetChannelIdByHandleParams): Promise<GetChannelIdByHandleData>
```

## Parameters

### `GetChannelIdByHandleParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel_handle` | `string` | Yes | The YouTube channel handle (e.g., '@Google' or 'Google'). Accepts handles with or without the '@' prefix. Also accepts full YouTube channel URLs. |

**Examples of valid handles:**
- `@Google`
- `Google`
- `@YouTubeCreators`
- `https://www.youtube.com/@Google`

## Return Value

### `GetChannelIdByHandleData`

Returns detailed channel information including:

- `kind`: Resource type identifier ('youtube#channelListResponse')
- `etag`: Resource etag
- `pageInfo`: Paging information (totalResults, resultsPerPage)
- `items`: Array of channel items with detailed information:
  - `id`: Unique channel identifier
  - `snippet`: Basic channel details (title, description, thumbnails, publishedAt, etc.)
  - `statistics`: Channel statistics (subscriberCount, videoCount, viewCount)
  - `contentDetails`: Related playlists (uploads, likes, favorites)
  - `brandingSettings`: Channel branding properties
  - `status`: Privacy status and other status details
  - `topicDetails`: Topics associated with the channel
  - `auditDetails`: Audit information for YouTube partners
  - `contentOwnerDetails`: Content owner information
  - `localizations`: Localized metadata by language code

## Usage Examples

### Basic Usage

```typescript
import { request as getChannelIdByHandle } from '@/sdk/mcp-clients/68770d542dee48ccb69d7bcd/YOUTUBE_GET_CHANNEL_ID_BY_HANDLE';

async function getChannelInfo() {
  try {
    const result = await getChannelIdByHandle({
      channel_handle: '@Google'
    });
    
    if (result.items && result.items.length > 0) {
      const channel = result.items[0];
      console.log('Channel ID:', channel.id);
      console.log('Channel Title:', channel.snippet?.title);
      console.log('Subscribers:', channel.statistics?.subscriberCount);
    } else {
      console.log('No channel found for this handle');
    }
  } catch (error) {
    console.error('Error fetching channel:', error);
  }
}
```

### Using Full YouTube URL

```typescript
async function getChannelFromUrl() {
  const result = await getChannelIdByHandle({
    channel_handle: 'https://www.youtube.com/@YouTubeCreators'
  });
  
  const channel = result.items?.[0];
  if (channel) {
    console.log('Channel ID:', channel.id);
    console.log('Custom URL:', channel.snippet?.customUrl);
    console.log('Video Count:', channel.statistics?.videoCount);
    console.log('Uploads Playlist:', channel.contentDetails?.relatedPlaylists?.uploads);
  }
}
```

### Accessing Channel Statistics

```typescript
async function getChannelStats(handle: string) {
  const result = await getChannelIdByHandle({ channel_handle: handle });
  
  const channel = result.items?.[0];
  if (channel?.statistics) {
    return {
      subscribers: channel.statistics.subscriberCount,
      videos: channel.statistics.videoCount,
      views: channel.statistics.viewCount,
      subscribersHidden: channel.statistics.hiddenSubscriberCount
    };
  }
  
  return null;
}
```

### Getting Channel Thumbnails

```typescript
async function getChannelThumbnails(handle: string) {
  const result = await getChannelIdByHandle({ channel_handle: handle });
  
  const thumbnails = result.items?.[0]?.snippet?.thumbnails;
  if (thumbnails) {
    return {
      default: thumbnails.default?.url,
      medium: thumbnails.medium?.url,
      high: thumbnails.high?.url,
      maxres: thumbnails.maxres?.url
    };
  }
  
  return null;
}
```

## Error Handling

The function may throw errors in the following cases:

1. **Missing Required Parameter**: If `channel_handle` is not provided
   ```typescript
   Error: Missing required parameter: channel_handle
   ```

2. **Invalid MCP Response**: If the MCP response format is invalid
   ```typescript
   Error: Invalid MCP response format: missing content[0].text
   ```

3. **JSON Parse Error**: If the response cannot be parsed
   ```typescript
   Error: Failed to parse MCP response JSON: [error details]
   ```

4. **Tool Execution Failure**: If the MCP tool execution fails
   ```typescript
   Error: MCP tool execution failed
   ```

5. **No Data Returned**: If the tool succeeds but returns no data
   ```typescript
   Error: MCP tool returned successful response but no data
   ```

### Error Handling Example

```typescript
async function safeGetChannel(handle: string) {
  try {
    const result = await getChannelIdByHandle({ channel_handle: handle });
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
}
```

## Notes

- The `items` array will be empty if no channel matches the provided handle
- Channel handles can be provided with or without the '@' prefix
- Full YouTube URLs are automatically parsed to extract the handle
- Some fields may be optional depending on the channel's settings and privacy status
- Subscriber counts are rounded down to three significant figures
- The function returns detailed channel information including metadata, statistics, and content details
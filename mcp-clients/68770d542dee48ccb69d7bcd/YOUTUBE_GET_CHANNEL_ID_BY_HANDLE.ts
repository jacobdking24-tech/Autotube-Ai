import { callMCPTool } from '@/sdk/core/mcp-client';

/**
 * MCP Response wrapper interface - MANDATORY
 * All MCP tools return responses in this wrapped format
 */
interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string; // JSON string containing actual tool data
  }>;
}

/**
 * Input parameters for getting a YouTube channel ID by handle
 */
export interface GetChannelIdByHandleParams {
  /**
   * The YouTube channel handle (e.g., '@Google' or 'Google'). 
   * Accepts handles with or without the '@' prefix. 
   * Also accepts full YouTube channel URLs (e.g., 'https://www.youtube.com/@Google'), 
   * from which the handle will be automatically extracted.
   * 
   * @example "@Google"
   * @example "Google"
   * @example "@YouTubeCreators"
   * @example "https://www.youtube.com/@Google"
   */
  channel_handle: string;
}

/**
 * Thumbnail image details
 */
export interface ThumbnailImage {
  /** The image's height */
  height?: number;
  /** The image's URL */
  url?: string;
  /** The image's width */
  width?: number;
}

/**
 * Thumbnail images associated with the channel
 */
export interface Thumbnails {
  /** The default thumbnail image. The default thumbnail for a channel is typically 88px by 88px. */
  default?: ThumbnailImage;
  /** A higher resolution version of the thumbnail image */
  medium?: ThumbnailImage;
  /** A high resolution version of the thumbnail image */
  high?: ThumbnailImage;
  /** A standard resolution version of the thumbnail image */
  standard?: ThumbnailImage;
  /** The maximum resolution version of the thumbnail image */
  maxres?: ThumbnailImage;
}

/**
 * Localized channel metadata
 */
export interface LocalizedMetadata {
  /** The localized channel description */
  description?: string;
  /** The localized channel title */
  title?: string;
}

/**
 * Localized versions of channel metadata
 */
export interface Localized {
  /** The localized channel description */
  description?: string;
  /** The localized channel title */
  title?: string;
}

/**
 * Basic details about the channel
 */
export interface Snippet {
  /** The country with which the channel is associated */
  country?: string;
  /** The channel's custom URL */
  customUrl?: string;
  /** The language of the text in the channel resource's snippet.title and snippet.description properties */
  defaultLanguage?: string;
  /** The channel's description. The property value has a maximum length of 1000 characters. */
  description?: string;
  /** Contains localized versions of the channel title and description */
  localized?: Localized;
  /** The date and time that the channel was created. The value is specified in ISO 8601 format. */
  publishedAt?: string;
  /** A map of thumbnail images associated with the channel */
  thumbnails?: Thumbnails;
  /** The channel's title */
  title?: string;
}

/**
 * Statistics about the channel
 */
export interface Statistics {
  /** Indicates whether the channel's subscriber count is publicly visible */
  hiddenSubscriberCount?: boolean;
  /** The number of subscribers that the channel has. This value is rounded down to three significant figures. */
  subscriberCount?: string;
  /** The number of public videos uploaded to the channel */
  videoCount?: string;
  /** The number of times the channel has been viewed */
  viewCount?: string;
}

/**
 * Playlist IDs associated with the channel
 */
export interface RelatedPlaylists {
  /** The ID of the playlist that contains the channel's favorite videos. This field is deprecated. */
  favorites?: string;
  /** The ID of the playlist that contains videos that the channel has marked as liked videos */
  likes?: string;
  /** The ID of the playlist that contains videos uploaded to the channel */
  uploads?: string;
}

/**
 * Information about the channel's content
 */
export interface ContentDetails {
  /** Identifies playlist IDs that are associated with the channel */
  relatedPlaylists?: RelatedPlaylists;
}

/**
 * Channel branding properties
 */
export interface BrandingChannel {
  /** The country with which the channel is associated */
  country?: string;
  /** The default language for the channel's metadata */
  defaultLanguage?: string;
  /** The channel description. The property value has a maximum length of 1000 characters. */
  description?: string;
  /** Keywords associated with the channel. The value is a space-separated list of strings. The maximum length is 500 characters. */
  keywords?: string;
  /** The channel title. The property value has a maximum length of 30 characters. */
  title?: string;
  /** The ID for a Google Analytics account that is used to track and measure traffic to the channel */
  trackingAnalyticsAccountId?: string;
  /** The video ID for the video that the channel will use as a trailer for unsubscribed viewers */
  unsubscribedTrailer?: string;
}

/**
 * Branding properties for the channel
 */
export interface BrandingSettings {
  /** Contains branding properties for the channel */
  channel?: BrandingChannel;
}

/**
 * Channel privacy status and other status details
 */
export interface Status {
  /** Indicates whether the channel data identifies a user that is linked to either a YouTube username or a Google+ account */
  isLinked?: boolean;
  /** Indicates whether the channel is eligible to upload videos that are more than 15 minutes long. Valid values: allowed, disallowed, eligible. */
  longUploadsStatus?: string;
  /** Indicates whether the channel is designated as child-directed, and contains content intended for children */
  madeForKids?: boolean;
  /** The channel's privacy status. Valid values: private, public, unlisted. */
  privacyStatus?: string;
  /** Indicates whether the channel owner explicitly designates the channel as child-directed */
  selfDeclaredMadeForKids?: boolean;
}

/**
 * Topics associated with the channel
 */
export interface TopicDetails {
  /** A list of Wikipedia URLs that describe the channel's content */
  topicCategories?: string[];
  /** A list of topic IDs that are associated with the channel. This field is deprecated as of November 10, 2016. */
  topicIds?: string[];
}

/**
 * Channel audit information relevant for YouTube partners
 */
export interface AuditDetails {
  /** Indicates whether the channel respects the community guidelines */
  communityGuidelinesGoodStanding?: boolean;
  /** Indicates whether the channel has any unresolved Content ID claims */
  contentIdClaimsGoodStanding?: boolean;
  /** Indicates whether the channel has any copyright strikes */
  copyrightStrikesGoodStanding?: boolean;
  /** Indicates whether the channel has any unresolved claims or strikes */
  overallGoodStanding?: boolean;
}

/**
 * Information about the content owner associated with the channel
 */
export interface ContentOwnerDetails {
  /** The ID of the content owner linked to the channel */
  contentOwner?: string;
  /** The date and time when the channel was linked to the content owner. The value is specified in ISO 8601 format. */
  timeLinked?: string;
}

/**
 * Localization value for channel metadata
 */
export interface LocalizationValue {
  /** The localized channel description */
  description?: string | null;
  /** The localized channel title */
  title?: string | null;
}

/**
 * YouTube channel item with detailed information
 */
export interface ChannelItem {
  /** Identifies the API resource type. The value will be 'youtube#channel'. */
  kind: string;
  /** The Etag of this resource */
  etag: string;
  /** The unique identifier for the YouTube channel */
  id: string;
  /** Contains basic details about the channel, such as its title, description, and thumbnail images */
  snippet?: Snippet;
  /** Contains information about the channel's content */
  contentDetails?: ContentDetails;
  /** Contains statistics about the channel */
  statistics?: Statistics;
  /** Contains information about topics associated with the channel */
  topicDetails?: TopicDetails;
  /** Contains information about the channel's privacy status and other status details */
  status?: Status;
  /** Contains branding properties for the channel */
  brandingSettings?: BrandingSettings;
  /** Contains channel audit information relevant for YouTube partners */
  auditDetails?: AuditDetails;
  /** Contains information about the content owner associated with the channel */
  contentOwnerDetails?: ContentOwnerDetails;
  /** Contains localized versions of the channel metadata. The object's keys are BCP-47 language codes. */
  localizations?: Record<string, LocalizationValue>;
}

/**
 * Paging information for the result set
 */
export interface PageInfo {
  /** The total number of results in the result set */
  totalResults: number;
  /** The number of results included in the API response */
  resultsPerPage: number;
}

/**
 * Output data containing YouTube channel information by handle
 */
export interface GetChannelIdByHandleData {
  /** Identifies the API resource type. The value will be 'youtube#channelListResponse'. */
  kind: string;
  /** The Etag of this resource */
  etag: string;
  /** Encapsulates paging information for the result set */
  pageInfo: PageInfo;
  /** List of channels that match the request criteria. Empty if no channel matches the handle. */
  items?: ChannelItem[];
  /** Token that can be used as the value of the pageToken parameter to retrieve the next page in the result set */
  nextPageToken?: string;
  /** Token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set */
  prevPageToken?: string;
}

/**
 * Internal response wrapper interface from outputSchema
 */
interface GetChannelIdByHandleResponse {
  /** Whether or not the action execution was successful or not */
  successful: boolean;
  /** Data from the action execution */
  data?: GetChannelIdByHandleData;
  /** Error if any occurred during the execution of the action */
  error?: string;
}

/**
 * Retrieves YouTube channel information by channel handle.
 * 
 * This function accepts a YouTube channel handle (with or without '@' prefix) or a full YouTube channel URL
 * and returns detailed channel information including ID, statistics, content details, and more.
 *
 * @param params - The input parameters containing the channel handle
 * @returns Promise resolving to the channel data including ID and metadata
 * @throws Error if the channel_handle parameter is missing or if the tool execution fails
 *
 * @example
 * const result = await request({ channel_handle: '@Google' });
 * console.log(result.items[0].id); // Channel ID
 */
export async function request(params: GetChannelIdByHandleParams): Promise<GetChannelIdByHandleData> {
  // Validate required parameters
  if (!params.channel_handle) {
    throw new Error('Missing required parameter: channel_handle');
  }
  
  // CRITICAL: Use MCPToolResponse and parse JSON response
  const mcpResponse = await callMCPTool<MCPToolResponse, GetChannelIdByHandleParams>(
    '68770d542dee48ccb69d7bcd',
    'YOUTUBE_GET_CHANNEL_ID_BY_HANDLE',
    params
  );
  
  if (!mcpResponse.content?.[0]?.text) {
    throw new Error('Invalid MCP response format: missing content[0].text');
  }
  
  let toolData: GetChannelIdByHandleResponse;
  try {
    toolData = JSON.parse(mcpResponse.content[0].text);
  } catch (parseError) {
    throw new Error(
      `Failed to parse MCP response JSON: ${
        parseError instanceof Error ? parseError.message : 'Unknown error'
      }`
    );
  }
  
  if (!toolData.successful) {
    throw new Error(toolData.error || 'MCP tool execution failed');
  }
  
  if (!toolData.data) {
    throw new Error('MCP tool returned successful response but no data');
  }
  
  return toolData.data;
}
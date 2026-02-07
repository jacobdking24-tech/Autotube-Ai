import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Youtube, Sparkles, TrendingUp, Upload, Eye, Settings, Plus, Trash2, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { UserORM, type UserModel } from "@/sdk/database/orm/orm_user";
import { YoutubeChannelORM, type YoutubeChannelModel } from "@/sdk/database/orm/orm_youtube_channel";
import { NicheORM, type NicheModel } from "@/sdk/database/orm/orm_niche";
import { VideoGenerationORM, type VideoGenerationModel, VideoGenerationStatus } from "@/sdk/database/orm/orm_video_generation";
import { generateCompleteVideo } from "@/services/video-generation";

export const Route = createFileRoute("/")({
	component: App,
});

const MOCK_USER_ID = "demo_user_123";

const POPULAR_NICHES = [
	"Finance & Investing",
	"Technology & AI",
	"Space & Astronomy",
	"Health & Fitness",
	"Self Improvement",
	"Business & Entrepreneurship",
	"Science & Education",
	"Gaming",
	"Cooking & Food",
	"Travel & Adventure"
];

function App() {
	const queryClient = useQueryClient();
	const [selectedNiche, setSelectedNiche] = useState<NicheModel | null>(null);
	const [newNicheName, setNewNicheName] = useState("");
	const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);

	const userORM = UserORM.getInstance();
	const youtubeChannelORM = YoutubeChannelORM.getInstance();
	const nicheORM = NicheORM.getInstance();
	const videoGenerationORM = VideoGenerationORM.getInstance();

	useEffect(() => {
		const initUser = async () => {
			try {
				const existingUsers = await userORM.getUserByEmail("demo@example.com");
				if (existingUsers.length === 0) {
					await userORM.insertUser([{
						email: "demo@example.com",
						password_hash: "demo_hash",
					} as UserModel]);
				}
			} catch (error) {
				console.error("Error initializing user:", error);
			}
		};
		initUser();
	}, []);

	const { data: youtubeChannel } = useQuery({
		queryKey: ["youtubeChannel", MOCK_USER_ID],
		queryFn: async () => {
			const channels = await youtubeChannelORM.getYoutubeChannelByUserId(MOCK_USER_ID);
			return channels[0] || null;
		},
	});

	const { data: niches = [] } = useQuery({
		queryKey: ["niches", MOCK_USER_ID],
		queryFn: async () => {
			const userNiches = await nicheORM.getNicheByUserId(MOCK_USER_ID);
			return userNiches;
		},
	});

	const { data: videoGenerations = [] } = useQuery({
		queryKey: ["videoGenerations", MOCK_USER_ID],
		queryFn: async () => {
			const generations = await videoGenerationORM.getVideoGenerationByUserId(MOCK_USER_ID);
			return generations.sort((a, b) => parseInt(b.create_time) - parseInt(a.create_time));
		},
	});

	const connectYouTubeMutation = useMutation({
		mutationFn: async () => {
			setIsConnectingYouTube(true);
			await new Promise(resolve => setTimeout(resolve, 2000));

			const channel: YoutubeChannelModel = {
				user_id: MOCK_USER_ID,
				channel_id: "UC_demo_" + Date.now(),
				channel_name: "Demo YouTube Channel",
				access_token: "demo_access_token",
				refresh_token: "demo_refresh_token",
				connected_at: Math.floor(Date.now() / 1000).toString(),
			} as YoutubeChannelModel;

			return await youtubeChannelORM.insertYoutubeChannel([channel]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["youtubeChannel"] });
			toast.success("YouTube channel connected successfully!");
			setIsConnectingYouTube(false);
		},
		onError: (error) => {
			toast.error("Failed to connect YouTube channel");
			console.error(error);
			setIsConnectingYouTube(false);
		},
	});

	const addNicheMutation = useMutation({
		mutationFn: async (nicheName: string) => {
			const niche: NicheModel = {
				user_id: MOCK_USER_ID,
				name: nicheName,
				is_active: true,
			} as NicheModel;

			return await nicheORM.insertNiche([niche]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["niches"] });
			setNewNicheName("");
			toast.success("Niche added successfully!");
		},
		onError: (error) => {
			toast.error("Failed to add niche");
			console.error(error);
		},
	});

	const deleteNicheMutation = useMutation({
		mutationFn: async (nicheId: string) => {
			await nicheORM.deleteNicheById(nicheId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["niches"] });
			toast.success("Niche deleted successfully!");
		},
		onError: (error) => {
			toast.error("Failed to delete niche");
			console.error(error);
		},
	});

	const generateVideoMutation = useMutation({
		mutationFn: async (nicheId: string) => {
			const niche = niches.find(n => n.id === nicheId);
			if (!niche) throw new Error("Niche not found");

			const topics = [
				`Top 10 ${niche.name} Trends in 2026`,
				`The Future of ${niche.name}: What You Need to Know`,
				`${niche.name} Explained: A Beginner's Guide`,
				`5 Mind-Blowing Facts About ${niche.name}`,
				`How ${niche.name} Will Change Everything`,
			];

			const randomTopic = topics[Math.floor(Math.random() * topics.length)];

			// Create initial database record
			const generation: VideoGenerationModel = {
				user_id: MOCK_USER_ID,
				niche_id: nicheId,
				topic: randomTopic,
				script: "Generating AI script...",
				status: VideoGenerationStatus.Generating,
			} as VideoGenerationModel;

			const created = await videoGenerationORM.insertVideoGeneration([generation]);
			const generationId = created[0].id;

			// Start background AI generation process
			(async () => {
				try {
					console.log("Starting AI video generation...");

					// Use real AI services to generate content
					const result = await generateCompleteVideo({
						topic: randomTopic,
						niche: niche.name,
						userId: MOCK_USER_ID
					});

					const [existing] = await videoGenerationORM.getVideoGenerationById(generationId);
					if (existing) {
						if (result.status === 'failed') {
							// Handle failure
							const updated: VideoGenerationModel = {
								...existing,
								status: VideoGenerationStatus.Failed,
								script: result.error || "Generation failed"
							};
							await videoGenerationORM.setVideoGenerationById(generationId, updated);
							toast.error(`Video generation failed: ${result.error}`);
						} else {
							// Success - update with AI-generated content
							const updated: VideoGenerationModel = {
								...existing,
								status: VideoGenerationStatus.Ready,
								script: result.script,
								thumbnail_url: result.thumbnailUrl,
								// Note: videoUrl and shortsUrl would be populated after video assembly
								// Currently showing placeholder since we don't have TTS/video assembly
								video_url: result.videoUrl || `[Video assembly not available - requires TTS and FFmpeg]`,
								shorts_url: result.shortsUrl || `[Shorts assembly not available - requires TTS and FFmpeg]`,
							};
							await videoGenerationORM.setVideoGenerationById(generationId, updated);
							toast.success("AI content generated! Script and thumbnail ready. Video assembly requires additional services.");
						}
						queryClient.invalidateQueries({ queryKey: ["videoGenerations"] });
					}
				} catch (error) {
					console.error("Error in AI generation:", error);
					const [existing] = await videoGenerationORM.getVideoGenerationById(generationId);
					if (existing) {
						const updated: VideoGenerationModel = {
							...existing,
							status: VideoGenerationStatus.Failed,
							script: `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}`
						};
						await videoGenerationORM.setVideoGenerationById(generationId, updated);
						queryClient.invalidateQueries({ queryKey: ["videoGenerations"] });
					}
					toast.error("AI generation failed. Check console for details.");
				}
			})();

			return created;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["videoGenerations"] });
			toast.success("AI video generation started! This may take 30-60 seconds...");
		},
		onError: (error) => {
			toast.error("Failed to start video generation");
			console.error(error);
		},
	});

	const uploadVideoMutation = useMutation({
		mutationFn: async (videoId: string) => {
			const [video] = await videoGenerationORM.getVideoGenerationById(videoId);
			if (!video) throw new Error("Video not found");

			await new Promise(resolve => setTimeout(resolve, 2000));

			const updated: VideoGenerationModel = {
				...video,
				status: VideoGenerationStatus.Uploaded,
				youtube_video_id: `YT_${Date.now()}`,
				youtube_shorts_id: `YTS_${Date.now()}`,
				uploaded_at: Math.floor(Date.now() / 1000).toString(),
			};

			return await videoGenerationORM.setVideoGenerationById(videoId, updated);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["videoGenerations"] });
			toast.success("Video uploaded to YouTube!");
		},
		onError: (error) => {
			toast.error("Failed to upload video");
			console.error(error);
		},
	});

	const getStatusBadge = (status: VideoGenerationStatus) => {
		switch (status) {
			case VideoGenerationStatus.Generating:
				return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Generating</Badge>;
			case VideoGenerationStatus.Ready:
				return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Ready</Badge>;
			case VideoGenerationStatus.Uploaded:
				return <Badge variant="default" className="gap-1 bg-blue-500"><Upload className="h-3 w-3" /> Uploaded</Badge>;
			case VideoGenerationStatus.Failed:
				return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const activeNiches = niches.filter(n => n.is_active);
	const totalVideos = videoGenerations.length;
	const uploadedVideos = videoGenerations.filter(v => v.status === VideoGenerationStatus.Uploaded).length;
	const generatingVideos = videoGenerations.filter(v => v.status === VideoGenerationStatus.Generating).length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
			<Toaster />

			<div className="border-b bg-white dark:bg-zinc-950">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
								<Youtube className="h-6 w-6 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold">YouTube AI Automation</h1>
								<p className="text-sm text-zinc-500">Automated Video Creation Platform</p>
							</div>
						</div>

						{youtubeChannel ? (
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="gap-2">
									<Youtube className="h-3 w-3" />
									{youtubeChannel.channel_name}
								</Badge>
							</div>
						) : (
							<Button
								onClick={() => connectYouTubeMutation.mutate()}
								disabled={isConnectingYouTube}
								className="gap-2"
							>
								{isConnectingYouTube ? (
									<><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
								) : (
									<><Youtube className="h-4 w-4" /> Connect YouTube</>
								)}
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{!youtubeChannel ? (
					<Card className="max-w-2xl mx-auto">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Youtube className="h-5 w-5" />
								Connect Your YouTube Channel
							</CardTitle>
							<CardDescription>
								Connect your YouTube account to start automating video creation and uploads
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Alert>
								<Sparkles className="h-4 w-4" />
								<AlertDescription>
									Once connected, you'll be able to generate AI-powered videos, thumbnails, and Shorts that are automatically uploaded to your channel.
								</AlertDescription>
							</Alert>
							<Button
								onClick={() => connectYouTubeMutation.mutate()}
								disabled={isConnectingYouTube}
								className="w-full gap-2"
								size="lg"
							>
								{isConnectingYouTube ? (
									<><Loader2 className="h-4 w-4 animate-spin" /> Connecting to YouTube...</>
								) : (
									<><Youtube className="h-4 w-4" /> Connect YouTube Account</>
								)}
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						<Alert className="bg-blue-50 border-blue-200">
							<Sparkles className="h-4 w-4 text-blue-600" />
							<AlertDescription className="text-sm text-blue-900">
								<strong>AI-Powered Platform:</strong> This system uses OpenAI GPT-4 for script generation and Google NanoBanana for image generation. Video assembly and text-to-speech require additional third-party services (ElevenLabs, FFmpeg) not currently integrated. Generated content includes AI scripts, thumbnails, and scene images.
							</AlertDescription>
						</Alert>

						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-zinc-500">Active Niches</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold">{activeNiches.length}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-zinc-500">Total Videos</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold">{totalVideos}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-zinc-500">Uploaded</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-blue-500">{uploadedVideos}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-zinc-500">Generating</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-orange-500">{generatingVideos}</div>
								</CardContent>
							</Card>
						</div>

						<Tabs defaultValue="generate" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="generate" className="gap-2">
									<Sparkles className="h-4 w-4" />
									Generate Videos
								</TabsTrigger>
								<TabsTrigger value="videos" className="gap-2">
									<Video className="h-4 w-4" />
									Video Library
								</TabsTrigger>
								<TabsTrigger value="niches" className="gap-2">
									<Settings className="h-4 w-4" />
									Manage Niches
								</TabsTrigger>
							</TabsList>

							<TabsContent value="generate" className="space-y-4 mt-6">
								{activeNiches.length === 0 ? (
									<Card>
										<CardContent className="py-12 text-center">
											<TrendingUp className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
											<h3 className="text-lg font-semibold mb-2">No Niches Yet</h3>
											<p className="text-zinc-500 mb-4">Add your first niche to start generating videos</p>
											<Button onClick={() => {
												const tabs = document.querySelector('[value="niches"]') as HTMLElement;
												tabs?.click();
											}}>
												<Plus className="h-4 w-4 mr-2" />
												Add Niche
											</Button>
										</CardContent>
									</Card>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{activeNiches.map((niche) => (
											<Card key={niche.id} className="hover:shadow-lg transition-shadow">
												<CardHeader>
													<CardTitle className="flex items-center justify-between">
														<span className="truncate">{niche.name}</span>
														<TrendingUp className="h-5 w-5 text-zinc-400 flex-shrink-0" />
													</CardTitle>
													<CardDescription>
														{videoGenerations.filter(v => v.niche_id === niche.id).length} videos generated
													</CardDescription>
												</CardHeader>
												<CardContent>
													<Button
														onClick={() => generateVideoMutation.mutate(niche.id)}
														disabled={generateVideoMutation.isPending}
														className="w-full gap-2"
													>
														<Sparkles className="h-4 w-4" />
														Generate Video
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</TabsContent>

							<TabsContent value="videos" className="space-y-4 mt-6">
								{videoGenerations.length === 0 ? (
									<Card>
										<CardContent className="py-12 text-center">
											<Video className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
											<h3 className="text-lg font-semibold mb-2">No Videos Generated</h3>
											<p className="text-zinc-500">Generate your first AI-powered video to get started</p>
										</CardContent>
									</Card>
								) : (
									<div className="space-y-3">
										{videoGenerations.map((video) => {
											const niche = niches.find(n => n.id === video.niche_id);
											return (
												<Card key={video.id}>
													<CardContent className="py-4">
														<div className="flex items-start justify-between gap-4">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-2">
																	{getStatusBadge(video.status)}
																	{niche && (
																		<Badge variant="outline" className="text-xs">
																			{niche.name}
																		</Badge>
																	)}
																</div>
																<h3 className="font-semibold mb-1 truncate">{video.topic}</h3>
																<p className="text-sm text-zinc-500 line-clamp-2">
																	{video.script || "Generating script..."}
																</p>
																{video.uploaded_at && (
																	<div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
																		{video.youtube_video_id && (
																			<span className="flex items-center gap-1">
																				<Youtube className="h-3 w-3" />
																				Video: {video.youtube_video_id}
																			</span>
																		)}
																		{video.youtube_shorts_id && (
																			<span className="flex items-center gap-1">
																				<Video className="h-3 w-3" />
																				Short: {video.youtube_shorts_id}
																			</span>
																		)}
																	</div>
																)}
															</div>
															<div className="flex gap-2 flex-shrink-0">
																{video.status === VideoGenerationStatus.Ready && (
																	<Button
																		onClick={() => uploadVideoMutation.mutate(video.id)}
																		disabled={uploadVideoMutation.isPending}
																		size="sm"
																		className="gap-1"
																	>
																		<Upload className="h-3 w-3" />
																		Upload
																	</Button>
																)}
																{video.status === VideoGenerationStatus.Uploaded && (
																	<Button
																		variant="outline"
																		size="sm"
																		className="gap-1"
																		asChild
																	>
																		<a href={`https://youtube.com/watch?v=${video.youtube_video_id}`} target="_blank" rel="noopener noreferrer">
																			<Eye className="h-3 w-3" />
																			View
																		</a>
																	</Button>
																)}
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								)}
							</TabsContent>

							<TabsContent value="niches" className="space-y-4 mt-6">
								<Card>
									<CardHeader>
										<CardTitle>Add New Niche</CardTitle>
										<CardDescription>
											Select a popular niche or create your own custom niche
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex gap-2">
											<Input
												placeholder="Enter custom niche..."
												value={newNicheName}
												onChange={(e) => setNewNicheName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" && newNicheName.trim()) {
														addNicheMutation.mutate(newNicheName.trim());
													}
												}}
											/>
											<Button
												onClick={() => {
													if (newNicheName.trim()) {
														addNicheMutation.mutate(newNicheName.trim());
													}
												}}
												disabled={!newNicheName.trim() || addNicheMutation.isPending}
											>
												<Plus className="h-4 w-4" />
											</Button>
										</div>

										<Separator />

										<div>
											<Label className="text-sm text-zinc-500 mb-3 block">Popular Niches</Label>
											<div className="flex flex-wrap gap-2">
												{POPULAR_NICHES.map((niche) => (
													<Button
														key={niche}
														variant="outline"
														size="sm"
														onClick={() => addNicheMutation.mutate(niche)}
														disabled={niches.some(n => n.name === niche)}
													>
														{niches.some(n => n.name === niche) ? "Added" : niche}
													</Button>
												))}
											</div>
										</div>
									</CardContent>
								</Card>

								{niches.length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle>Your Niches ({niches.length})</CardTitle>
											<CardDescription>
												Manage your content niches
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{niches.map((niche) => (
													<div
														key={niche.id}
														className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-zinc-950"
													>
														<div className="flex items-center gap-3">
															<TrendingUp className="h-4 w-4 text-zinc-400" />
															<div>
																<div className="font-medium">{niche.name}</div>
																<div className="text-xs text-zinc-500">
																	{videoGenerations.filter(v => v.niche_id === niche.id).length} videos
																</div>
															</div>
														</div>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => deleteNicheMutation.mutate(niche.id)}
															disabled={deleteNicheMutation.isPending}
														>
															<Trash2 className="h-4 w-4 text-red-500" />
														</Button>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}
							</TabsContent>
						</Tabs>
					</div>
				)}
			</div>
		</div>
	);
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "lucide-react";
import type { TauriProject } from "@/lib/bindings";
import { commands } from "@/lib/bindings";
import { tt } from "@/lib/i18n";
import { toastError, toastSuccess, toastThrownError } from "@/lib/toast";

export function ProjectThumbnail({
	project,
	className,
}: {
	project: TauriProject;
	className?: string;
}) {
	const baseClass =
		"aspect-square shrink-0 overflow-hidden rounded bg-secondary object-cover";

	if (project.thumbnail_url == null) {
		return (
			<div
				className={`flex items-center justify-center text-muted-foreground ${baseClass} ${className ?? ""}`}
			>
				<Image className="size-5" />
			</div>
		);
	}

	return (
		<img
			src={project.thumbnail_url}
			alt=""
			className={`${baseClass} ${className ?? ""}`}
		/>
	);
}

export function useProjectThumbnailMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			projectPath,
			action,
		}: {
			projectPath: string;
			action: "set" | "remove";
		}) => {
			if (action === "set") {
				return commands.environmentSetProjectThumbnail(projectPath);
			}

			await commands.environmentRemoveProjectThumbnail(projectPath);
			return null;
		},

		onSuccess: async (result) => {
			if (result === "NoFileSelected") return;
			if (result === "InvalidSelection") {
				toastError(tt("projects:toast:invalid thumbnail"));
				return;
			}

			toastSuccess(tt("projects:toast:thumbnail updated"));
			await queryClient.invalidateQueries({
				queryKey: ["environmentProjects"],
			});
		},

		onError: (error) => {
			console.error("Error updating project thumbnail", error);
			toastThrownError(error);
		},
	});
}

export function useBadgeCount() {
	const dueFerments = useDueFerments();
	const overdueFerments = useOverdueFerments();

	watchEffect(() => {
		const count = (dueFerments.data.value?.length ?? 0) + (overdueFerments.data.value?.length ?? 0);
		useTauriWebviewWindowGetCurrentWebviewWindow().setBadgeCount(count > 0 ? count : undefined);
	});
}

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
    async onNeedRefresh() {
        if (confirm(`Update available`)) {
            await updateSW();
        }
    },
});

// TODO: Router setup here

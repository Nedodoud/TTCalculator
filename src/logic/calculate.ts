//import type { TaskTypeConfig } from "../types";

import { ref, onMounted, onUnmounted } from "vue";


export function calculateSum(a: number, b: number, c: number): number {
    return a + b + c;
}

export function useIsMobile() {

    const isMobile = ref(window.innerHeight > window.innerWidth);

    function updateLayout() {
        isMobile.value = window.innerHeight > window.innerWidth;
    }

    onMounted(() => {
        updateLayout();

        window.addEventListener("resize", updateLayout);

        // На некоторых мобильных браузерах orientationchange
        // приходит раньше resize, поэтому подписываемся и на него.
        window.addEventListener("orientationchange", updateLayout);
    });

    onUnmounted(() => {
        window.removeEventListener("resize", updateLayout);
        window.removeEventListener("orientationchange", updateLayout);
    });

    return {
        isMobile
    };
}
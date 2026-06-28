<script setup lang="ts">
import DesktopLayout from "./layouts/DesktopLayout.vue";
import MobileLayout from "./layouts/MobileLayout.vue";

import { useIsMobile } from "./logic/calculate";

const { isMobile } = useIsMobile();
</script>

<template>

    <DesktopLayout v-if="!isMobile" 
                :isMobile="isMobile"/>

    <MobileLayout v-else 
                :isMobile="isMobile"/>

</template>
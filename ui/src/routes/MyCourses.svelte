<script>
  import { onMount } from "svelte";
  import { currentUser, fetchRecords } from "../lib/pocketbase";
  import { isLoading, isSidebarVisible } from "../lib/store";
  import Sidebar from "../components/Sidebar.svelte";
  import Courses from "../components/Courses.svelte";
  import { navigate } from "svelte-routing";
  import Title from "../components/Title.svelte";
  import { t } from "../lib/i18n";
  import { Capacitor } from "@capacitor/core";

  let platform = "";

  onMount(async () => {
    platform = Capacitor.getPlatform();
    if ($currentUser) {
      $isLoading = true;
      await fetchRecords();
      $isLoading = false;
    } else {
      navigate("/login");
    }
  });
</script>

<Title suffix={$t("myCourses")} />

{#if $currentUser}
  <main class="flex justify-between lg:overflow-x-hidden">
    <Sidebar
      isCoursesVisible={true}
      isLessonsVisible={false}
      currentLessonId={undefined}
    />
    {#if platform === "web" || (!$isSidebarVisible && platform !== "web")}
      <Courses />
    {/if}
  </main>
{/if}

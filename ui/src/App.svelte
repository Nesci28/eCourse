<script>
  import { Router, Route } from "svelte-routing";
  import { currentUser } from "./lib/pocketbase";
  import NotFound from "./routes/NotFound.svelte";
  import Login from "./routes/Login.svelte";
  import MyCourses from "./routes/MyCourses.svelte";
  import Lesson from "./routes/Lesson.svelte";
  import Search from "./components/Search.svelte";
  import Alert from "./components/Alert.svelte";
  import { t, locale, locales } from "./lib/i18n";
  import { SafeArea } from "capacitor-plugin-safe-area";

  (async () => {
    const windowHeight = window.innerHeight;
    const safeAreaData = await SafeArea.getSafeAreaInsets();
    const { insets } = safeAreaData;

    for (const [key, value] of Object.entries(insets)) {
      document.documentElement.style.setProperty(
        `--safe-area-inset-${key}`,
        `${value}px`,
      );
    }
  })();
</script>

<header class="sticky h-[var(--safe-area-inset-top)] top-0 z-50 w-full bg-dark"></header>

<div class="w-full z-0">
  {#if $currentUser}
    <Search />
    <Alert />
  {/if}

  <Router>
    <Route path="/" component={MyCourses} />
    <Route path="/login" component={Login} />
    <Route path="/:lessonId" component={Lesson} />
    <Route component={NotFound} />
  </Router>
</div>

<footer class="sticky h-[var(--safe-area-inset-bottom)] bottom-0 z-50 w-full bg-dark"></footer>

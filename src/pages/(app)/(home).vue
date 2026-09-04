<script setup>
/**
 * Displays the application home page.
 */
import { definePage } from "vue-router/experimental";

definePage({
	name: "home",
	redirect: { name: "sample-pages" },
});
</script>

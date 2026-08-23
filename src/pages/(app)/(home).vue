<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "home",
	redirect: { name: "sample-pages" },
});
</script>

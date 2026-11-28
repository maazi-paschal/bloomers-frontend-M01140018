const { createApp } = Vue;

createApp({
  // data properties for the vue instance
  data() {
    return {
      apiBaseUrl: "http://localhost:3000",
      lessons: [],
      searchQuery: "",
      selectedHub: "all",
      sortBy: "topic",
      sortOrder: "asc",
      searchTimer: null,
      loading: false,
      errorMessage: "",
    };
  },

  computed: {
    sortedLessons() {
      // Step 1: Filter by selected hub while keeping all lessons when "all" is chosen
      const hubFiltered =
        this.selectedHub === "all"
          ? this.lessons
          : this.lessons.filter((lesson) =>
              String(lesson.location || "")
                .toLowerCase()
                .includes(this.selectedHub.toLowerCase()),
            );

      // Step 2: Sort the filtered lessons based on the selected field and order
      const list = [...hubFiltered];
      const field = this.sortBy;
      const direction = this.sortOrder === "asc" ? 1 : -1;

      // comparing pairs of values in the list to put them in order
      return list.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        // for numbers
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * direction;
        }

        // for alphabetic values, we use localeCompare to compare the string representations of the values, ignoring case sensitivity.
        return (
          String(valA || "").localeCompare(String(valB || ""), undefined, {
            sensitivity: "base",
          }) * direction
        );
      });
    },
  },

  mounted() {
    this.fetchLessons();
  },

  methods: {
    // method to fetch lessons from the API and handle errors
    async fetchLessons() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const response = await fetch(`${this.apiBaseUrl}/lessons`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load lessons.");
        }
        this.lessons = data;
      } catch (error) {
        this.errorMessage =
          error.message || "We encountered an error while fetching lessons.";
      } finally {
        this.loading = false;
      }
    },
    // method that runs whenever the user types in the search input field. It clears any existing timer and sets a new one to call the searchLessons method after 250 milliseconds of inactivity.
    handleSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.searchLessons();
      }, 250); //250 milliseconds delay to avoid excessive API calls while typing
    },

    // method to search for lessons based on the search query, uses the /search endpoint
    async searchLessons() {
      const trimmed = this.searchQuery.trim();
      if (!trimmed) {
        await this.fetchLessons();
        return;
      }

      this.loading = true;
      this.errorMessage = "";
      try {
        const url = `${this.apiBaseUrl}/search?q=${encodeURIComponent(trimmed)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to search lessons.");
        }
        this.lessons = data;
      } catch (error) {
        this.errorMessage =
          error.message || "We encountered an error while searching lessons.";
      } finally {
        this.loading = false;
      }
    },

    // method to clear the search query and reset the lesson list
    clearSearch() {
      this.searchQuery = ""; //clearing input text
      clearTimeout(this.searchTimer);
      this.fetchLessons();
    },

    // method to toggle the sort order between ascending and descending
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },
  },
}).mount("#app");

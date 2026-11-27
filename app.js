const {createApp} = Vue;

createApp({
    data() {
        return {
            // Switching to my render URL once I deploy
            apiBaseUrl: 'http://localhost:3000',
            lessons: [],
            loading: false,
            errorMessage: ""
        };
    },

    mounted() {
        this.fetchLessons();
    },

    methods: {
        async fetchLessons() {
            this.loading = true;
            this.errorMessage = "";
            try{
                const response = await fetch(`${this.apiBaseUrl}/lessons`);
                const data = await response.json();
                if(!response.ok) {
                    throw new Error(data.error || "Unable to load lessons.");
                }
                this.lessons = data;
            } catch (error) {
                this.errorMessage = error.message || "We encountered an error while fetching lessons.";
            } finally {
                this.loading = false;
            }
        }
    }
}).mount('#app');
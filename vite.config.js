import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5500,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: './index.html',
        admin: './admin.html',
        dashboard: './dashboard.html',
        login: './login.html',
        review: './review.html',
        testPlay: './test-play.html',
        test: './test.html',
        cccnotes: './cccnotes.html',
        olevelnotes: './olevelnotes.html',
        ittool: './ittool.html',
        syllabus: './syllabus.html',
        olevelsyllabus: './olevelsyllabus.html',
        notes: './notes.html',
        practice: './practice.html',
        otherwebsites: './otherwebsites.html',
        terms: './terms.html',
        education: './education.html',
        cybersecurity: './cybersecurity.html',
        ccctest: './ccctest.html',
        m1r5test: './m1r5test.html',
        chapter1test: './chapter1test.html',
        chapter6test: './chapter6test.html',
        chapter7test: './chapter7test.html',
        book1test: './book1test.html',
        allchaptertestccc: './allchaptertestccc.html',
        Aiwebsite: './Aiwebsite.html',
        setupDatabase: './setup-database.html'
      }
    }
  }
});

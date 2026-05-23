/* ============================================================
 * data.js — Fat Cat Rolling site content
 * ============================================================
 *
 * THIS IS THE ONLY FILE KIM EDITS to update site content.
 *
 * Rules (or the site breaks):
 *   1. Every line inside [ ] or { } needs a comma at the end
 *      EXCEPT the last one.
 *   2. Wrap any text in "double quotes" or 'single quotes'.
 *      If your text contains an apostrophe like "Kim's",
 *      use double quotes: "Kim's" — NOT 'Kim's'.
 *   3. Filenames in /images/ must be lowercase, hyphens only,
 *      no spaces, no parentheses. e.g. "hot-chocolate.webp"
 *   4. After editing, open validate.html in your browser
 *      to check for errors BEFORE pushing to GitHub.
 *
 * GALLERY FILE TYPES (you asked!):
 *   - type: "image"  → .png .jpg .jpeg .gif .webp .svg
 *   - type: "video"  → .mp4 or .webm  (add a "poster" still too)
 *   For animation previews, a short muted MP4 is better than a
 *   GIF: smaller file, sharper, smoother. GIF still works as an
 *   "image" if you prefer. Video tiles show the poster still by
 *   default. Hover the tile (desktop) to preview the clip muted.
 *   Click to play the full video in the lightbox with sound.
 *
 * Need to add a new gallery item? Copy a block, paste below it,
 * change the fields. Save. Open validate.html.
 * ============================================================ */

try {
  window.SITE_DATA = {

    /* ------ Profile (shows in hero, footer, about) ------ */
    profile: {
      name: "Kim Nguyen",
      brand: "Fat Cat Rolling",
      /* roles — the discipline list shown in the hero meta */
      roles: [
        "Character Animator",
        "Technical Animator",
        "VFX Artist",
        "AR / VR"
      ],
      location: "Los Angeles, CA",
      email: "hello@fatcatrolling.com",
      /* socials — "label" is the clickable text shown under
         Elsewhere / in the footer. Change label/url freely;
         add or remove a whole line to add/remove a link. */
      socials: {
        instagram: { label: "Instagram", url: "https://instagram.com/fatcatrolling" },
        vimeo:     { label: "Vimeo",     url: "https://vimeo.com/kimthuvunguyen" },
        linkedin:  { label: "LinkedIn",  url: "https://linkedin.com/in/kimthuvunguyen" }
      },
      /* credits — drives BOTH the scrolling Credits strip and
         the Credits list on the About page. name + link. */
      credits: [
        { name: "Snap Inc.",              url: "https://snap.com" },
        { name: "Stoopid Buddy Stoodios", url: "https://www.leagueofbuddies.com/" },
        { name: "Crunchyroll",            url: "https://www.crunchyroll.com" },
        { name: "Bix Pix Entertainment",  url: "https://www.bixpix.com/" },
        { name: "ACME Filmworks",         url: "https://www.acmefilmworks.com/" }
      ],
      /* heroImages — OPTIONAL small floating images that drift
         with the cursor on the HOME hero. Leave [] for none
         (nothing breaks). Add 3–5 small square PNG/SVGs later:
           heroImages: ["images/float-1.png", "images/float-2.png"]
         Decorative only. */
      heroImages: []
    },

    /* ------ Reels (one per page) ------
     * provider: "vimeo" | "youtube" | "placeholder"
     * poster:   the still shown before the visitor clicks
     *           (export one frame of your reel as JPG/PNG and
     *           drop the filename here; until then the SVG
     *           placeholder shows). Click = plays the reel. */
    reels: {
      tech: {
        //title: "Technical Animation Reel",
        provider: "vimeo",
        id: "1183955314",
        poster: "images/poster-tech.webp",
        duration: "2:00",
        year: 2026,
        shotlist: [
          { time: "00:03", project: "Snap The Look",                  role: "AI workflow protoype" },
          { time: "00:12", project: "Bitmoji Lens Production",        role: "Character animation + Lens assembly + Real-time VFX" },
          { time: "00:41", project: "Personal Exploration Projects",  role: "Characters and Props creation + Rig + Animation + Lens assembly" },
          { time: "01:01", project: "Boy and Toy",                    role: "Character animation + AI visual development" },
          { time: "01:07", project: "VFX for Stop-motion Animation",  role: "VFX creation + Shot cleanup + Composition" },
          { time: "01:23", project: "General Dupont Doing Laundry",   role: "Short 3D animated film - all roles" },
          { time: "01:43", project: "Noodles VR",                     role: "Short interactive VR story - all roles" }
        ]
      },
      animation: {
        //title: "Character Animation Reel",
        provider: "vimeo",
        id: "80145786",
        poster: "images/poster-animation.webp",
        duration: "2:00",
        year: 2026,
        shotlist: [
          { time: "00:03", project: "Bitmoji Lens Production",        role: "Character animation + Lens assembly + Real-time VFX" },
          { time: "00:58", project: "Personal Exploration Projects",  role: "Characters and Props creation + Rig + Animation + Lens assembly" },
          { time: "01:24", project: "General Dupont Doing Laundry",   role: "Short 3D animated film - all roles" },
          { time: "01:43", project: "Noodles VR",                     role: "Short interactive VR story - all roles" },
          { time: "01:47", project: "Quill VR",                       role: "3D illustration in Quill VR" }
        ]
      },
      vfx: {
        //title: "VFX Reel",
        provider: "vimeo",
        id: "650912555",
        poster: "images/poster-vfx.webp",
        duration: "2:00",
        year: 2026,
        shotlist: [
          { time: "00:03", project: "Bitmoji Lens Production",        role: "Real-time VFX + AI FX animation + Real-time lighting + Lens assembly" },
          { time: "00:34", project: "VFX for Stop-motion Animation",  role: "VFX creation + Shot cleanup + Composition" },
          { time: "01:13", project: "General Dupont Doing Laundry",   role: "Short 3D animated film - all roles" },
          { time: "01:13", project: "Personal VFX Projects",          role: "VFX creation + Procedural animation - all roles" }
        ]
      }
    },

    /* ------ Gallery items, per page ------
     * Each item: { type, src, title, alt }
     *   type: "image" or "video"  (see file-type note up top)
     *   src:  the file in /images/
     *   alt:  short description (for screen readers / accessibility)
     *   title: used for the accessible label (not shown on screen)
     * For a VIDEO item, also add a poster:
     *   { type: "video", src: "images/clip.mp4",
     *     poster: "images/clip-still.jpg", title: "...", alt: "..." }
     * (tag / year are no longer shown on the tile — fine to omit.)
     */
    gallery: {
      home: [
        /*
        { type: "image", src: "images/tile-eating.svg",        title: "Eating",               alt: "Eating — character animation still" },
        { type: "image", src: "images/tile-rig-demo.svg",      title: "Facial Rig Demo",      alt: "Facial rig demonstration" },
        { type: "image", src: "images/tile-hot-chocolate.svg", title: "Hot Chocolate",        alt: "Hot Chocolate — fluid sim still" },
        { type: "image", src: "images/tile-snap-lens.svg",     title: "Snap Lens",            alt: "Snap Lens Studio capture" },
        { type: "image", src: "images/tile-sleepy-puppy.svg",  title: "Sleepy Puppy Octopus", alt: "Sleepy Puppy Octopus — FX still" },
        { type: "image", src: "images/tile-unreal-scene.svg",  title: "Unreal Scene Test",    alt: "Unreal Engine scene test" },
        { type: "image", src: "videos/webp/snapthelook.webp",  title: "Bitmoji Fashion",    alt: "Bitmoji Fashion" },
        */
        //VIDEO example (uncomment + point at a real .mp4 once exported):
        { type: "video", src: "videos/webm/snapthelook_me_web.webm", poster: "videos/webp/snapthelook.webp", title: "Bitmoji Snap The Look Lens", alt: "Bitmoji Snap The Look Lens demo" },
        { type: "video", src: "videos/webm/fsh_winter_web.webm", poster: "videos/webp/fsh_winter.webp", title: "Bitmoji Fashion Try-on Lens - Winter", alt: "Bitmoji Fashion Try-on Lens Winter theme demo" },
        { type: "video", src: "videos/webm/yearbook_web.webm", poster: "videos/webp/yearbook.webp", title: "Bitmoji Adoption Lens - Yearbook 2025", alt: "Bitmoji Adoption Lens Yearbook 2025 demo, on the left user without Bitmoji would see themselve, on the right user with Bitmoji would see their Bitmoji" },
        { type: "video", src: "videos/webm/running_web.webm", poster: "videos/webp/running.webp", title: "Bitmoji Adoption Lens - Running", alt: "Bitmoji Adoption Lens Running demo, on the left user without Bitmoji would see a no traits avatar, on the right user with Bitmoji would see their Bitmoji" },
        { type: "video", src: "videos/webm/spookyseason.webm", poster: "videos/webp/spookyseason.webp", title: "Bitmoji Spooky Season Lens", alt: "Bitmoji Spooky Season Lens demo" },
        { type: "video", src: "videos/webm/uglydoll.webm", poster: "videos/webp/uglydoll.webp", title: "Bitmoji Ugly Doll Lens", alt: "Bitmoji Ugly Doll Lens demo" },
        { type: "video", src: "videos/webm/thisisfine.webm", poster: "videos/webp/thisisfine.webp", title: "Bitmoji This Is Fine Lens", alt: "Bitmoji This Is Fine Lens demo" },
        { type: "video", src: "videos/webm/macrorefinement.webm", poster: "videos/webp/macrorefinement.webp", title: "Bitmoji Macro Refinement Lens", alt: "Bitmoji Macro Refinement Lens demo" }
      
      ],
      animation: [
        { type: "video", src: "videos/webm/hot_chocolate_web.webm", poster: "videos/webp/festivalslaurels_square.webp", title: "Hot Chocolate", alt: "Hot Chocolate 2D animated short film" },
        { type: "video", src: "videos/webm/general_dupont_doing_laundry_web.webm", poster: "videos/webp/gd_doinglaundry_laurels_square.webp", title: "General Dupont Doing Laundry", alt: "General Dupont Doing Laundry 3D animated short film" },
        { type: "video", src: "videos/webm/noodles_vr_web.webm", poster: "videos/webp/noodles_square.webp", title: "Noodles VR", alt: "Noodles VR clips" },
        { type: "video", src: "videos/webm/boyandtoy_web.webm", poster: "videos/webp/boyandtoy_square.webp", title: "Boy and Toy", alt: "Boy and Toy with background replacement test" }
      ],
      vfx: [
        { type: "video", src: "videos/webm/vresh_web.webm", poster: "videos/webp/vresh_square_web.webp", title: "Vresh Commercial", alt: "Vresh Commercial video" },
        { type: "video", src: "videos/webm/air_canada_web.webm", poster: "videos/webp/air_canada_web.webp", title: "Air Canada Commercial", alt: "Air Canada Commercial clip" },
        { type: "video", src: "videos/webm/modok_101_web.webm", poster: "videos/webp/modok_101_square.webp", title: "M.O.D.O.K.", alt: "M.O.D.O.K. clip" },
        { type: "video", src: "videos/webm/solaropposite_holiday_wtf_web.webm", poster: "videos/webp/solaropposite_holiday_wtf_web.webp", title: "Solar Opposite - Holiday Special", alt: "Solar Opposite - Holiday Special clips" }
      ]
    },

    /* ------ About page content ------
     * shortBio = the big lead line at the top of About
     * longBio  = the paragraph under it
     * experience[] = the Experience list. Each entry has:
     *   role       — job title
     *   studio     — employer name
     *   location   — city, state (optional)
     *   years      — date range, e.g. "Apr 2022 – Present"
     *   highlights — array of 1–3 accomplishment bullet strings
     *   skills     — comma-separated tools/techniques string
     * (Credits list + Elsewhere links come from profile above) */
    about: {
      shortBio: "Kim Nguyen is a hybrid animator living at the intersection of art and technology — asking both how it works and how it makes us feel.",
      longBio: "Kim Nguyen is a multi-disciplinary animator and technical artist in Los Angeles, working at the seam where generative AI meets production craft. At Snap, she helped build the Snap the Look Lens — a customized ComfyUI pipeline that translates real-world fashion onto Bitmoji avatars through visual reference analysis — and ran Bitmoji Fashion Lenses end to end, from 3D content generation through QA and deployment. She prototypes AI-assisted styling workflows with Claude to turn photos and text into digital fashion, and rigs and animates 3D assets across the Snapchat app. Before Snap, she delivered VFX for Robot Chicken, Crossing Swords, and M.O.D.O.K. — scene tracking, 3D effects simulation, lip-sync, and rotoscoping at television sprint pace — and produced motion graphics for 360° and immersive media. Two questions drive every project: does it work well, and does it feel good.",
      experience: [
        {
          role:     "3D / Bitmoji Technical Animator",
          studio:   "Snap Inc.",
          location: "Santa Monica, CA",
          years:    "Apr 2022 – Present",
          highlights: [
            "Produce Bitmoji Fashion Lenses end to end — 3D content generation, rigging, animation, QA, and deployment to the Snapchat app.",
            "Built a customized ComfyUI pipeline for AI-assisted Bitmoji fashion asset creation; documented workflow for team adoption.",
            "Support QA and bug triage for avatar and lens experiences; continuously optimize the animation production pipeline."
          ],
          skills: "Lens Studio, ComfyUI, Maya, rigging, 3D animation, AI pipeline, QA/bug triage, pipeline optimization"
        },
        {
          role:     "VFX Compositor",
          studio:   "Stoopid Buddy Stoodios",
          location: "Burbank, CA",
          years:    "Mar 2018 – Jul 2018 · Sep 2019 – Jan 2022",
          highlights: [
            "Composited VFX for Robot Chicken, Crossing Swords, M.O.D.O.K., and SuperMansion — credited on multiple award-winning Adult Swim productions.",
            "Executed 2D/3D motion tracking, keying, rotoscoping, set extension, and rig removal at TV production pace.",
            "Animated character lip-sync and performed shot cleanup and color correction in After Effects and Blender."
          ],
          skills: "After Effects, Blender, 2D/3D tracking, compositing, keying, rotoscoping, lip-sync, set extension, rig removal, color correction"
        },
        {
          role:     "Video Editor / VFX / Motion Graphics",
          studio:   "VRenetic Inc.",
          location: "Los Angeles, CA",
          years:    "Jul 2018 – Sep 2019",
          highlights: [
            "Created motion graphics, live action video, and 360° content for the Vresh Social App across promotional campaigns.",
            "Filmed, edited, and composited immersive media assets across multiple formats including 360° video and standard promotional content."
          ],
          skills: "After Effects, Premiere Pro, motion graphics, 360° video, live action editing, compositing"
        },        
        {
          role:     "VFX Artist",
          studio:   "Crunchyroll / Ellation Studios",
          location: "Burbank, CA",
          years:    "Feb 2021 – Jun 2021",
          highlights: [
            "Animated character lip-sync for the series Freak Angels and integrated it seamlessly into existing 2D animation footage."
          ],
          skills: "After Effects, lip-sync animation, 2D compositing, 2D animation integration"
        }
        /*
        {
          role:     "VFX Artist",
          studio:   "Fat Cat Rolling, LLC.",
          location: "Huntington Beach, CA",
          years:    "Jun 2021 – Jul 2021",
          highlights: [
            "Added VFX to an unannounced TV pilot — live action footage tracking, character lip-sync and facial expression animation, and 2D-to-live-action compositing."
          ],
          skills: "After Effects, live action tracking, lip-sync, facial expression animation, compositing"
        },
        */
        
      ]
    },

    /* ------ Page-level copy ------
     * Edit any heading or description here — no HTML needed.
     *
     *   heroName    = the big H1 name in the hero (same on every page)
     *   reelHeading = the title above the reel video
     *   reelDesc    = the small italic line UNDER the reel title
     *   workHeading = the title above the gallery grid
     *   workDesc    = the small italic line UNDER the gallery title
     *
     * Footer fields shared across all pages live in pages.footer below.
     * ============================================================ */
    pages: {
      home: {
        /* heroName — the H1 in the hero on the Home page */
        heroName:     "Kim Nguyen",
        /* reelHeading — title above the Technical Animation reel */
        reelHeading:  "Technical Animation Reel",
        /* workHeading — title above the Featured Work gallery */
        workHeading:  "Featured Work",
        /* workDesc — subtitle line under the gallery heading */
        workDesc:     ""
      },
      animation: {
        /* heroName — the H1 in the hero on the Animation page */
        heroName:    "Kim Nguyen",
        /* reelHeading — title above the Animation reel */
        reelHeading: "Character Animation Reel",
        /* workHeading — title above the animation gallery */
        workHeading: "Featured Work",
        /* workDesc — subtitle line under the gallery heading */
        workDesc:    ""
      },
      vfx: {
        /* heroName — the H1 in the hero on the VFX page */
        heroName:    "Kim Nguyen",
        /* reelHeading — title above the VFX reel */
        reelHeading: "VFX/Composition Reel",
        /* workHeading — title above the VFX gallery */
        workHeading: "Featured Work",
        /* workDesc — subtitle line under the gallery heading */
        workDesc:    ""
      },
      about: {
        /* heroName — the H1 in the hero on the About page */
        heroName:          "Kim Nguyen",
        /* experienceHeading — title above the job-history list */
        experienceHeading: "Experience",
        /* creditsHeading — title above the studio credits list */
        creditsHeading:    "Credits",
        /* elsewhereHeading — "Elsewhere" heading in the About page footer column */
        elsewhereHeading:  "Elsewhere"
      },
      footer: {
        /* cta — the large clickable text in the footer (links to About page) */
        cta: "Let's work together",
        /* elsewhereHeading — "Elsewhere" column heading in the footer (all pages).
           About page uses pages.about.elsewhereHeading above; all other pages fall back here. */
        elsewhereHeading: "Elsewhere",
        /* pagesHeading — "Pages" column heading in the footer (home, animation, vfx pages) */
        pagesHeading: "Pages",
        /* reelsHeading — "Reels" column heading in the footer (about page only) */
        reelsHeading: "Reels",
        /* creditsLabel — the small label beside the scrolling studio credits strip */
        creditsLabel: "Credits",
        /* tagline — the small line at the very bottom of every page, next to the copyright */
        tagline: "Hand-built, no cookies, no tracking.",
        /* Footer nav link labels — rename any of these to change the text
           in the footer Pages/Reels columns across all pages. */
        navHome:      "Home",
        navTechnical: "Technical Animation",
        navAnimation: "Animation",
        navVfx:       "VFX",
        navAbout:     "About"
      }
    }

  };
} catch (e) {
  /* If data.js has a syntax error, script.js will catch this and
     show a banner with the error message so Kim can fix it. */
  window.SITE_DATA = null;
  window.SITE_DATA_ERROR = e;
}

// app/ui/langs.js
export const en = {
  appName: "Ravchamo",
  tagline: "If you don't know what to eat",
  location: "Location",
  requestLocation: "Update location",
  loc: {
    ready: "Location ready",
    getting: "Getting location...",
    deniedVake: "Permission denied — using Vake center."
  },
  setLocation: "Set my location...",
  budget: "Select a budget",
  low: "Under 20₾",
  medium: "20 – 40₾",
  high: "40₾ +",
  cravings: "What are you craving?",
  time: "Time",
  fast: "Fast",
  relaxed: "Relaxed",
  openNow: "Open now",
  findDishes: "Show options",
  seeResults: "Show results",
  lucky: "I'm feeling lucky",
  feelingLucky: "I'm feeling lucky",
  resultsTop: "Top picks",
  fetchingFood: "Fetching your food...",
  noMatches: "No matches yet. Try fewer filters.",
  call: "Call",
  openInMaps: "Open in Maps",
  gel: "GEL",
  back: "Back to results",
  backToResults: "Back to results",
  goHome: "Home",
  directions: "Directions",
  openOnWolt: "Open on Wolt ↗",
  woltLangPath: "en",
  disclaimer:
    "Menu data may be inaccurate. Always check with the restaurant about allergens and availability.",

  // Mood layer (multi-select, max 2)
  moodTitle: "Pick your vibe (pick up to 2)",
  moodHint: "At least one — this shapes your picks.",
  moods: {
    hungry: "Very hungry 🍔",
    protein: "High protein 💪",
    diet: "On a diet 🥗",
    sweet: "Sweet tooth 🍰",
    spicy: "Spicy 🌶",
    hangover: "Hangover cure 🍳",
    strange: "Something strange 👽",
    surprise: "Surprise me 🎁"
  },

  // Districts (top-level, not inside tags)
  districts: {
    vake: "Vake",
    vera: "Vera",
    saburtalo: "Saburtalo",
    mtatsminda: "Mtatsminda",
    sololaki: "Sololaki",
    old_town: "Old Town",
    chugureti: "Chugureti / Marjanishvili",
    avlabari: "Avlabari",
    isani: "Isani",
    didube: "Didube",
    gldani: "Gldani",
    samgori: "Samgori",
    nadzaladevi: "Nadzaladevi",
    didi_digomi: "Didi Digomi",
    tbilisi: "Tbilisi",
    outer: "Outer Tbilisi"
  },

  // Cravings — UI tokens map to raw data Category values via lib/taxonomy.js
  tags: {
    georgian: "Georgian",
    asian: "Asian",
    pizza_pasta: "Pizza & Pasta",
    fast_food: "Fast food",
    healthy: "Healthy",
    vegetarian_vegan: "Vegetarian / Vegan",
    breakfast: "Breakfast",
    dessert: "Dessert",

    district: "Districts"
  }
};

export const ka = {
  appName: "რა ვჭამო?",
  tagline: "თუ არ იცი რა ჭამო",
  location: "ადგილმდებარეობა",
  requestLocation: "ლოკაციის განახლება",
  loc: {
    ready: "ლოკაცია მზად არის",
    getting: "ლოკაცია იტვირთება...",
    deniedVake: "უფლება არ არის — ვაკის ცენტრს ვიყენებთ."
  },
  setLocation: "ჩემი ლოკაცია...",
  budget: "აირჩიე ბიუჯეტი",
  low: "20₾-მდე",
  medium: "20-40₾",
  high: "40₾+",
  cravings: "რა გაგისწორდება?",
  time: "დრო",
  fast: "სწრაფად",
  relaxed: "მშვიდად",
  openNow: "ახლა ღიაა",
  findDishes: "შედეგების ნახვა",
  seeResults: "შედეგების ნახვა",
  lucky: "დამირენდომე",
  feelingLucky: "არ ვიცი რა მინდა",
  resultsTop: "საუკეთესო ვარიანტები",
  fetchingFood: "მიმდინარეობს კერძების მოძიება...",
  noMatches: "შედეგი ვერ მოიძებნა. სცადე ნაკლები ფილტრი.",
  call: "დარეკვა",
  openInMaps: "გახსენი რუკაზე",
  gel: "₾",
  back: "უკან შედეგებზე",
  backToResults: "უკან შედეგებზე",
  goHome: "მთავარი",
  directions: "მიმართულება",
  openOnWolt: "ვოლტზე გადასვლა ↗",
  woltLangPath: "ka",
  disclaimer:
    "მენიუს მონაცემები შესაძლოა არ იყოს ზუსტი. ინფორმაცია ალერგენებსა და ხელმისაწვდომობაზე გადაამოწმეთ უშუალოდ რესტორანთან.",

  moodTitle: "აირჩიე განწყობა (მაქს. 2)",
  moodHint: "მინიმუმ ერთი — ეს განსაზღვრავს არჩევანს.",
  moods: {
    hungry: "ძალიან მშია 🍔",
    protein: "ცილაზე ვარ 💪",
    diet: "დიეტაზე ვარ 🥗",
    sweet: "ტკბილი მინდა 🍰",
    spicy: "ცხარე 🌶",
    hangover: "ნაბახუსევზე ვარ 🍳",
    strange: "რამე უცნაური 👽",
    surprise: "გამაკვირვე 🎁"
  },

  districts: {
    vake: "ვაკე",
    vera: "ვერა",
    saburtalo: "საბურთალო",
    mtatsminda: "მთაწმინდა",
    sololaki: "სოლოლაკი",
    old_town: "ძველი თბილისი",
    chugureti: "ჩუღურეთი / მარჯანიშვილი",
    avlabari: "ავლაბარი",
    isani: "ისანი",
    didube: "დიდუბე",
    gldani: "გლდანი",
    samgori: "სამგორი",
    nadzaladevi: "ნაძალადევი",
    didi_digomi: "დიდი დიღომი",
    tbilisi: "თბილისი",
    outer: "გარე თბილისი"
  },

  tags: {
    georgian: "ქართული",
    asian: "აზიური",
    pizza_pasta: "პიცა და პასტა",
    fast_food: "სწრაფი კვება",
    healthy: "ჯანსაღი",
    vegetarian_vegan: "ვეგეტარიანული / ვეგანური",
    breakfast: "საუზმე",
    dessert: "დესერტი",

    district: "რაიონები"
  }
};

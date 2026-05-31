// app/ui/langs.js
export const en = {
  appName: "Ravchamo",
  tagline: "what should I eat?",
  location: "Location",
  loc: {
    ready: "Location ready",
    getting: "Getting location...",
    deniedVake: "Permission denied — using Vake center."
  },
  setLocation: "Set my location...",
  budget: "Select a budget",
  low: "Low",
  medium: "Medium",
  high: "High",
  cravings: "Pick cravings (optional)",
  time: "Time",
  fast: "Fast",
  relaxed: "Relaxed",
  openNow: "Open now",
  findDishes: "Show options",
  seeResults: "Show results",
  lucky: "I'm feeling lucky",
  feelingLucky: "I’m feeling lucky",
  resultsTop: "Top picks",
  noMatches: "No matches yet. Try fewer filters.",
  call: "Call",
  openInMaps: "Open in Maps",
  gel: "GEL",
  back: "Back to results",
  backToResults: "Back to results",
  goHome: "Go Home",
  openOnWolt: "Open on Wolt ↗",
  woltLangPath: "en",
  disclaimer:
    "Menu data may be inaccurate. Always check with the restaurant about allergens and availability.",

  // Mood layer (single-select)
  moodTitle: "What's your vibe?",
  moodHint: "Pick one – this helps tailor your picks.",
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
  loc: {
    ready: "ლოკაცია მზად არის",
    getting: "ლოკაცია იტვირთება...",
    deniedVake: "უფლება არ არის — ვაკის ცენტრს ვიყენებთ."
  },
  setLocation: "ჩემი ლოკაცია...",
  budget: "აირჩიე ბიუჯეტი",
  low: "20₾-მდე",
  medium: "40₾-მდე",
  high: "ძვირიანი",
  cravings: "რა გაგისწორდება (არასავალდებულო)",
  time: "დრო",
  fast: "სწრაფად",
  relaxed: "მშვიდად",
  openNow: "ახლა ღიაა",
  findDishes: "შედეგების ნახვა",
  seeResults: "შედეგების ნახვა",
  lucky: "დამირენდომე",
  feelingLucky: "არ ვიცი რა მინდა",
  resultsTop: "საუკეთესო ვარიანტები",
  noMatches: "შედეგი ვერ მოიძებნა. სცადე ნაკლები ფილტრი.",
  call: "დარეკვა",
  openInMaps: "გახსენი რუკაზე",
  gel: "₾",
  back: "უკან შედეგებზე",
  backToResults: "უკან შედეგებზე",
  goHome: "მთავარზე",
  openOnWolt: "ვოლტზე გადასვლა ↗",
  woltLangPath: "ka",
  disclaimer:
    "მენიუს მონაცემები შესაძლოა არ იყოს ზუსტი. ინფორმაცია ალერგენებსა და ხელმისაწვდომობაზე გადაამოწმეთ უშუალოდ რესტორანთან.",

  moodTitle: "რის განწყობაზე ხარ?",
  moodHint: "აირჩიე ერთი - ასე უკეთეს შედეგს მიიღებ",
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

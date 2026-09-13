import { cookies } from "next/headers";

export type Lang = "hr" | "en";

export const LANG_COOKIE = "lang";

export const dict = {
  hr: {
    appName: "Popis želja",
    tagline: "Napravi popis darova, pošalji poveznicu svojima, i nitko ne kupi isto dvaput.",
    makeList: "Napravi popis",
    newList: "Novi popis",
    listTitle: "Naslov popisa",
    listTitlePh: "Ivanov 40. rođendan",
    eventDate: "Datum proslave",
    eventDateHint: "Popis se briše 30 dana nakon ovog datuma, osim ako ga sačuvaš za dogodine.",
    note: "Poruka (neobavezno)",
    notePh: "Ne morate ništa donositi, ali ako baš želite…",
    create: "Napravi popis",
    titleRequired: "Upiši naslov popisa.",

    savedTitle: "Popis je napravljen",
    shareLinkLabel: "Poveznica za dijeljenje",
    shareLinkHelp: "Ovu šalji svojima. S njom vide popis i rezerviraju darove.",
    adminLinkLabel: "Tvoja poveznica za uređivanje",
    adminLinkHelp: "Ovu zadrži za sebe i spremi u favorite. Nema je načina vratiti ako je izgubiš.",
    copy: "Kopiraj",
    copied: "Kopirano",
    toMyList: "Otvori moj popis",

    addGift: "Dodaj dar",
    editGift: "Uredi dar",
    giftUrl: "Poveznica na trgovinu",
    giftUrlHint: "Zalijepi poveznicu pa pritisni Dohvati — naslov, sliku i cijenu popunit ćemo sami.",
    fetch: "Dohvati",
    fetching: "Dohvaćam…",
    fetchFailed: "Nismo uspjeli pročitati tu stranicu. Upiši podatke ručno.",
    giftTitle: "Što je to",
    giftTitlePh: "Espresso aparat",
    giftPrice: "Cijena",
    giftNote: "Napomena",
    giftNotePh: "Bilo koja boja osim crne",
    priority: "Koliko ga želiš",
    prioNone: "Nije bitno",
    prioNice: "Bilo bi lijepo",
    prioLove: "Jako bih volio/voljela",
    save: "Spremi",
    cancel: "Odustani",
    edit: "Uredi",
    del: "Obriši",
    up: "Gore",
    down: "Dolje",

    emptyOwner: "Popis je još prazan. Dodaj prvi dar.",
    emptyPublic: "Vlasnik popisa još nije dodao nijedan dar.",
    counter: (a: number, b: number) => `${a} od ${b} rezervirano`,
    counterHelp: "Ne vidiš tko je što uzeo — tako ti ostaje iznenađenje.",
    listSettings: "Postavke popisa",
    deleteList: "Obriši popis",
    deleteListWarn: "Ovo trajno briše popis i sve rezervacije. Poveznice prestaju raditi.",
    archive: "Sačuvaj za dogodine",
    archiveHelp: "Zatvara popis za rezervacije i spašava ga od automatskog brisanja.",
    archived: "Popis je sačuvan i zatvoren za rezervacije.",
    reopen: "Otvori za novu godinu",
    reopenWarn:
      "Ovo briše sve rezervacije, vraća sve darove na slobodno i pravi novu poveznicu za dijeljenje. Stara prestaje raditi.",
    expiresIn: (d: number) => `Popis se briše za ${d} dana.`,
    keepIt: "Sačuvaj ga",
    deleteItemWarn: "Netko je već rezervirao ovaj dar. Sigurno ga brišeš?",
    urlChangeWarn: "Netko je već rezervirao ovaj dar. Ako promijeniš poveznicu, možda kupi krivu stvar.",
    confirmYes: "Da, nastavi",

    claimIt: "Uzimam ovaj",
    takenBy: (n: string) => `Uzima ${n}`,
    youTake: "Ovo uzimaš ti",
    undo: "Poništi",
    notYou: "Nisi ti? Unesi svoj kod",
    releaseCode: "Kod rezervacije",
    release: "Oslobodi dar",
    wrongCode: "Taj kod ne odgovara ovoj rezervaciji.",
    yourName: "Tvoje ime",
    yourNamePh: "Baka Ana",
    nameRequired: "Upiši ime da ostali znaju tko uzima ovaj dar.",
    confirm: "Rezerviraj",
    claimedTitle: "Rezervirano",
    yourCodeIs: "Tvoj kod je",
    keepCode:
      "Zapiši ga. Bez njega ne možeš osloboditi ovaj dar s drugog telefona ili ako obrišeš povijest preglednika.",
    gotIt: "U redu, zapisao/la sam",
    tooLate: "Netko je upravo uzeo taj dar. Popis je osvježen.",
    hideTaken: "Sakrij rezervirano",
    showTaken: "Prikaži i rezervirano",
    openShop: "Otvori u trgovini",
    closed: "Ovaj popis je zatvoren.",
    notFound: "Popis ne postoji ili je obrisan.",
    notFoundHelp: "Provjeri poveznicu. Popisi se brišu 30 dana nakon proslave.",
    home: "Početna",
    langSwitch: "English",
  },
  en: {
    appName: "Wishlist",
    tagline: "Make a list of gifts, send the link to your people, and nobody buys the same thing twice.",
    makeList: "Create a list",
    newList: "New list",
    listTitle: "List title",
    listTitlePh: "Ivan's 40th",
    eventDate: "Date",
    eventDateHint: "The list is deleted 30 days after this date, unless you keep it for next year.",
    note: "Note (optional)",
    notePh: "You really don't have to bring anything, but if you insist…",
    create: "Create list",
    titleRequired: "Give the list a title.",

    savedTitle: "List created",
    shareLinkLabel: "Share link",
    shareLinkHelp: "Send this one to your people. It lets them see the list and claim gifts.",
    adminLinkLabel: "Your editing link",
    adminLinkHelp: "Keep this one to yourself and bookmark it. There is no way to recover it.",
    copy: "Copy",
    copied: "Copied",
    toMyList: "Open my list",

    addGift: "Add a gift",
    editGift: "Edit gift",
    giftUrl: "Shop link",
    giftUrlHint: "Paste a link and press Fetch — we'll fill in the title, image and price.",
    fetch: "Fetch",
    fetching: "Fetching…",
    fetchFailed: "Couldn't read that page. Fill the details in yourself.",
    giftTitle: "What is it",
    giftTitlePh: "Espresso machine",
    giftPrice: "Price",
    giftNote: "Note",
    giftNotePh: "Any colour except black",
    priority: "How much you want it",
    prioNone: "No preference",
    prioNice: "Would be nice",
    prioLove: "Would love it",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    del: "Delete",
    up: "Up",
    down: "Down",

    emptyOwner: "The list is empty. Add the first gift.",
    emptyPublic: "The owner hasn't added any gifts yet.",
    counter: (a: number, b: number) => `${a} of ${b} claimed`,
    counterHelp: "You can't see who took what — that's how the surprise survives.",
    listSettings: "List settings",
    deleteList: "Delete list",
    deleteListWarn: "This permanently deletes the list and every claim. Both links stop working.",
    archive: "Keep for next year",
    archiveHelp: "Closes the list for claims and saves it from automatic deletion.",
    archived: "This list is saved and closed for claims.",
    reopen: "Open for a new year",
    reopenWarn:
      "This deletes every claim, sets all gifts back to available, and makes a new share link. The old one stops working.",
    expiresIn: (d: number) => `This list will be deleted in ${d} days.`,
    keepIt: "Keep it",
    deleteItemWarn: "Someone has already claimed this gift. Delete it anyway?",
    urlChangeWarn: "Someone has already claimed this gift. Changing the link may make them buy the wrong thing.",
    confirmYes: "Yes, continue",

    claimIt: "I'll get this",
    takenBy: (n: string) => `${n} is getting this`,
    youTake: "You're getting this",
    undo: "Undo",
    notYou: "Not you? Enter your code",
    releaseCode: "Claim code",
    release: "Release gift",
    wrongCode: "That code doesn't match this claim.",
    yourName: "Your name",
    yourNamePh: "Grandma Ana",
    nameRequired: "Add your name so others know who's getting this.",
    confirm: "Claim it",
    claimedTitle: "Claimed",
    yourCodeIs: "Your code is",
    keepCode:
      "Write it down. Without it you can't release this gift from another phone or after clearing your browser.",
    gotIt: "Got it, written down",
    tooLate: "Someone just grabbed that one. The list has been refreshed.",
    hideTaken: "Hide claimed",
    showTaken: "Show claimed too",
    openShop: "Open in shop",
    closed: "This list is closed.",
    notFound: "That list doesn't exist, or it has been deleted.",
    notFoundHelp: "Check the link. Lists are deleted 30 days after the event.",
    home: "Home",
    langSwitch: "Hrvatski",
  },
} as const;

export type Dict = (typeof dict)["hr"];

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "hr";
}

export async function getDict(): Promise<{ lang: Lang; t: Dict }> {
  const lang = await getLang();
  return { lang, t: dict[lang] as Dict };
}

export function formatPrice(cents: number | null, currency: string | null, lang: Lang): string | null {
  if (cents == null) return null;
  try {
    return new Intl.NumberFormat(lang === "hr" ? "hr-HR" : "en-GB", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency || "EUR"}`;
  }
}

export function formatDate(d: Date | null, lang: Lang): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

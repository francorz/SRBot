module.exports = {
    invisChars: new RegExp(
        /[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu
    ),
    invisChar: new RegExp(
        /[\u034f\u2800\u{E0000}\u180e\ufeff\u2000-\u200d\u206D]/gu
    ),
    racism: new RegExp(
        /((?:(?:\b(?<![-=])|monka)(?:[Nnñ]|[Ii7]V)|[|]\\[|])[\s]*?[liI1y!j|]+[\s]*?(?:[GgbB6934Q🅱qğĜƃ၅5][\s]*?){2,}(?!arcS|l|Ktlw|ylul|ie217|64|\d? ?times))|(\b((?=[nhk])(n[i1!¡jl]b+[e3]r|nygg[e3]r|higger|kneeger)[s5z]?)\b)|((chinam[ae]n|ching[\W_]*chong))|((towel|rag|diaper)[\W_]*head[s5z]?)|((sheep|goat|donkey)\W?(fuck|shag)\w*)|((sand|dune)[\W_]*(n[i1!¡jl]g(?!ht)|c[o0]{2}n|monk[iey]+)\w*)/gimu
    ),
    racism2: new RegExp(
        /((?=(the h[o0]l[o0]caust|gen[o0]cide|there was))(?<!saying )(?<!say )(?<!that )((the holocaust|genocide) ((didn[ ''‘’´`]?t|never) happened|(is|was) a lie)|There was( no|n[ ''‘’´`]?t an?y?)( \w+)? (genocide|holocaust)))(in[\W_]*bred[s5z]?)|filthy jew|(bl[a4]cks?|africans?) bastard|musl[i1]ms are (violent )?t[e3]rrorists?|r[e3]t[a4]rded m[0o]nkey|(bl[a4]cks?|africans?) (are|can be|were) (subhuman|primitive)|blackface/gimu
    ),
    racism3: new RegExp(
        /\b[cĆćĈĉČčĊċÇçḈḉȻȼꞒꞓꟄꞔƇƈɕ]+\b[ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}\b[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+\b[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*/gimu
    ),
    racism5: new RegExp(/[Nnñ][i1|][GgbB6934Q🅱qğĜƃ၅5][e3]r|nigga/gi),
    accents: new RegExp(/[\u0300-\u036f\u00a0-\uffff]/g),
    punctuation: new RegExp(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g),
    nonEnglish: new RegExp(/[^ -~\u0080-\uFFFF]+/gu),
    slurs: new RegExp(
        /((f|ph)[áàâäãåa@][g4]+[e3o0]*t*\b)|((?=T)(tr[a@4]nn(y|[i¡1!jl]es?|er)|trans(v[eai]st[iy]te|fag|mental)|trapsexual)|she\W?males?)[s5z]?|(bull)?(?=d[yi]ke)(?<!Van\W(?=Dyke\b))d[yi]ke[s5z]?|(?=\w{7})\w+?f([a@4]|e(?=gg))[gq69]+([o0]|(?<=[ae]gg)i|e(?<=mcfagge))t[s5z]?|(fudge\W?packer|muff\W?diver|(carpet|rug)\W?muncher|pillow\W?biter|shirt\W?lifter|shit\W?stabber|turd\W?burglar)|boiola|tranny|women are nothing more than objects|women are objects|holocaust|playo|\b[fḞḟ][a4@][g]\b|[fḞḟ]+[a4@]+[g]+[o0]+[t]+/gim
    ),
    slurs2: new RegExp(
        /amerykaniec|\bangol\b|arabus|asfalt|bambus|brudas|brudaska|Brytol|chachoł|chinol|ciapaty|czarnuch|fryc|gudłaj|helmut|japoniec|kacap|kacapka|kitajec|koszerny|kozojebca|kudłacz|makaroniarz|małpa|Moskal|negatyw|parch|pejsaty|rezun|Rusek|Ruska|skośnooki|syfiara|syfiarz|szkop|szmatogłowy|szuwaks|szwab|szwabka|\bturas\b|wietnamiec|żabojad|żółtek|żydek|Żydzisko|zabojad|zoltek|zydek|zydzisko|matoglowy|chachol|szuwak|\btura\b/gim
    ),
    slurs3: new RegExp(
        /[cĆćĈĉČčĊċÇçḈḉȻȼꞒꞓꟄꞔƇƈɕ]+[hĤĥȞȟḦḧḢḣḨḩḤḥḪḫH̱ẖĦħⱧⱨꞪɦꞕΗНн]+[[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ]+[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*/gim
    ),
    slurs4: new RegExp(
        /[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ]+[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[aÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ4]+[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+([iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+|[yÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+|[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*/gim
    ),
    slurs5: new RegExp(
        /[fḞḟƑƒꞘꞙᵮᶂ]+[aÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ4@]+[gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]+([ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅiÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ]+([rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[yÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+|[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+)?)?[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*/gim
    ),
    login: new RegExp(/^[A-Z_\d]{3,25}$/i),
    tos: new RegExp(
        /\b(h[i1!¡jl]tl[e3]r|kms|kys|simp|incel)\b|i[''‘’´`]?(ll| will|( a)?m(m?a| go(ing to|nna))?| wan(t to|na))( \S+)? (k([i1!jl.\-_]{3}|\\?[^a-z\d\s]ll)|shoot|murder|hang|lynch|poison) ((y+[o0ua]+|u+))(r( \S+)? family)?|(?<!\w )cut (y([o0u]+r|o)|ur)\W?sel(f|ves)(?! \w)|should(a|\W?ve| have)* ((k[i1!jl.\-_](ll|lled)|hanged|hung|shot|shoot|exterminated|suicided|roped(?! \w+(\Wsel\w+)? (into|off|from))|drowned|necked) (y([o0u]+r|o)|ur|the[my]|dem)\W?sel(f|ves)|aborted (y([o0ua]+r?|o)|ur?))|((?=go)(?<!gonna )(?<!going to )(?<!n[o\W]t )go (die|jump (off|out|from)))|(?=should ?n[o''‘’´`]?t)(?<!I )should ?n[o''‘’´`]?t (be|stay) alive|\br[a4@]p[il1]st\b|\br[a4]p[e3]\b/gim
    ),
    tos2: new RegExp(
        /(?=drink)(?<!t )drink (poison|bleach)|(?=slit)(?<!t (have|need) to )slit (y([o0u]+r|o)|ur)|r[a4@]p[e3]\W?(toy|meat|doll|slut|bait|slave|material|[s5$z](l|[^\w\s])([uv]|[^\w\s])[t7]|wh([o0]|[^\w\s])((r|[^\w\s])[e3]|[o0][a@4e3])|hole|face|body|pig)[s5z]?|(?=com+it|end|take)(?<!(n[o\W]t|you) )(?<!\bto )(com+it suicide|(?<!I will )(?<!want to )(?<!wanna )com+it die|(?<!could )(?<!likely )end your( own)? life(?! in\b)|take your( own)? life)|p[e3]d[o0]ph[i1]l[e3]|p[e0]d[o0]|eat (a|my) (dick|cock|penis)|sieg heil|heil hitler/gim
    ),
    tos3: new RegExp(
        /pull the [^\s.]+( dam\w*| fuck\S+)? trigger(?! on(?! (yo)?ur\W?self))|blows? (\w+\W+(?<!\.)){1,4}(?<!my )(?<!own )brains? out|(?=play)(?<!to )(?<!n[o\W]t )play in (some )?traffic|(get|be) raped(?! with| on\b)(?<!can be raped)(?<!meant to be raped)|\br[a4@]p([e3][sd]?\b|[i1!¡jl]ng) (her|hi[ms]|the[my]|dem)|throats? (cut|ripped|slit)|pedo|pedobear|(lick|eat|suck|gobble) (my|your|his|her|their|our) (cock|dick|balls|cum|kok|coc)|^get (cancer|a( \w+)? tumor|AIDS|HIV|covid\w*|coronavirus|sick)|\b(suck|lick|gobble|consume|eat)\b.*?\b(my|these)\b.*?\b(cock|penis|dick|balls|nuts)|((show|flash|expose) (you|your|those|them) (tits|boobs|breasts|ass|cock|pussy|vagina|crotch))\b/gim
    ),
    tos4: new RegExp(
        /\b(?:(?:i|my age)\s*['’]?\s*(?:am|'m|m| is|will be)\s*(?:(under|below)\s*)?(?:less\s*than\s*)?\s+(1[0-4]|[5-9]|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)))|(?:(?:tengo\s*|no\s*he\s*(?:alcanzado|llegado\s*a)\s*los\s*)(1[0-3]|[7-9]|(?:uno*|do[sz]|tre[sz]|[ck]uatro|[csz]in[ck]o|[csz]ei[sz]|[csz]iete|ocho|nue[vb]e|die[csz]|on[csz]e|do[csz]e|tre[csz]e))\s+(?:años*))|(?:(?:tengo|no\s*cumplo\s*los\s*|mi \s*edad\s*(?:está\s*de\s*bajo\s*de|es\s*inferior\s*a)\s*)(1[0-3]|[7-9]|(?:uno*|do[sz]|tre[sz]|[ck]uatro|[csz]in[ck]o|[csz]ei[sz]|[csz]iete|ocho|nue[vb]e|die[csz]|on[csz]e|do[csz]e|tre[csz]e))\s+(?:años*)*?)/gim
    ),
    tos5: new RegExp(
        /(\b(stick|shove|insert|force|put)\b.*?\b(in (my|their|h[eris]{2}|your))\b.*?\b(ass|butt|vagina|asshole|cunt)\b)|(\b([1li][0o][il][il]s?|[1li][0o]l[il]cons?)\b)/gi
    ),
    tos6: new RegExp(
        /((k[i1]l+|[e3]nd|sh[0oO]+t)\s?(y[0oO]ur?)\s?(s[e3]l+f)?)/gi
    ),
    url: new RegExp(
        /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:~+#-]*[\w@?^=%&~+#-])/g
    ),
    ableism: new RegExp(
        /(?=\br)(?<!\b[a\Wi]m )r+[\W_]*[e3a4@i1!¡jlw]*[\W_]*[t7]+[\W_]*[a4@e3]*[\W_]*r+[\W_]*[dt]+[\W_]*([e3i1!¡jl]+[\W_]*[dt]+[\W_]*)?([s5z]|(?<=retarded)\w+|(?<!retard)ation)?|(th|d|(?=it\W*i?s(?! autism)))((is|at(?! autism)|(?<=th)[ts]|it)([ ''‘’´`]?i?s)?|ese|ose|em) autis(t(ic|ism)?|m)|retard|ass\W?burger/gim
    ),
    advertising: new RegExp(
        /(?:[fḞḟƑƒꞘꞙᵮᶂ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[w]+[s]?|raid|host|w(a|4)tch|view|ch(e|3)ck|j(o|0)in|(?:go|come)\s?to)\s(?:o(?:ut|n))?\s?(?:m[ye]|us|him|her|them)\s(?:stream|channel|live|out\b)|(?:i'?m|we're|us|s?he'?s?|they'?re)\s?(?:live|streaming)|(f|f[o0][wl]|flw|[fḞḟƑƒꞘꞙᵮᶂ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[w]+[s]?)\s*(4|f(o|0)r)\s*(f|f[o0][wl]|flw|[fḞḟƑƒꞘꞙᵮᶂ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[w]+[s]?)|[fḞḟƑƒꞘꞙᵮᶂ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[ÓóÒòŎŏÔôỐꝌꝍⱺＯｏo0]+[w]+[s]? (me|them|us|him|her|b(4|a)ck)|f[0o]ll[0o]w[i1]ng ([e3]v[3e]ry(one|1)|anyone)?\s?(b[a4]ck)?/gim
    ),
    sellerbot: new RegExp(
        /(?:cheap|buy|promotion|offer|visit|best)\b.*\b(?:vie(?:w͙e̤|we)rs|followers|views|chat bots|ranking|growth|tools|success)\b|(?:NEZHNA|\w\s+\.(?:com|net)|dot com|streamboo|dogehype|smmtop15|remove the space)|(?:add me up on my discord)/gim
    ),
};

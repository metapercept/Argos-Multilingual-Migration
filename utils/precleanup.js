const fs = require("fs");
const path = require("path");
const { getDefaultEntries } = require("./precleanupMappings");

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function listXmlFiles(dir, out = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await listXmlFiles(fullPath, out);
    } else if (entry.isFile() && /\.xml$/i.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function sortEntries(entries) {
  return entries
    .slice()
    .sort((a, b) => a.length - b.length)
    .reverse();
}

function loadFindAndReplaceEntries(iniPath) {
  const raw = fs.readFileSync(iniPath, "utf8");
  const lines = raw.split(/\r?\n/);
  return sortEntries(lines.map((line) => line.replace(/\r?\n$/, "")));
}

function applyFindAndReplace(file, entries) {
  for (const rawEntry of entries) {
    let entry = rawEntry;
    entry = entry.replace(/<style><find>/gs, "");
    entry = entry.replace(/<\/replace><\/style>/gs, "");
    entry = entry.replace(/<\/find><replace>/gs, "==");

    const parts = entry.split("==");
    const search = parts[0] ?? "";
    const replace = parts[1] ?? "";

    try {
      file = file.replace(new RegExp(search, "gs"), replace);
    } catch (error) {
      throw new Error(`Invalid regex in findAndReplace.ini: ${search}`);
    }
  }
  return file;
}

function fmFilesCleanUp(file, folder, entries) {
  file = applyFindAndReplace(file, entries);

  // Remove processing instructions
  file = file.replace(/<\?([^>]*?)\?>/g, "");

  file = file.replace(/<ROOT>/gs, "<topics>");
  file = file.replace(/<\/ROOT>/gs, "</topic>\n</topics>");
  file = file.replace(/<TITLE> <\/TITLE>/gs, "\n");

  // List filtration
  file = file.replace(
    /<Workstep1>(.*?)<\/Workstep1>\n<Workstep-List>/gs,
    "<Workstep-List>\n<Workstep1>$1</Workstep1>"
  );

  // Cross reference
  file = file.replace(/<A ID="pgfId\-([0-9]+)"><\/A>/gs, "");
  file = file.replace(/<A ID="pgfId\-([0-9]+)"\/>/gs, "");
  file = file.replace(/<A ID="marker\-([0-9]+)"><\/A>/gs, "");
  file = file.replace(/<A ID="marker\-([0-9]+)"\/>/gs, "");
  file = file.replace(/<A ID="([^>]*?)"><\/A>/gs, '<a id="$1"/>');
  file = file.replace(/<A ID="([^>]*?)"\/>/gs, '<a id="$1"/>');
  file = file.replace(
    /<A href="([^>]*?)" ([^>]*?) CLASS="URL">([^>]*?)<\/A>/gs,
    '<url href="$1">$3</url>'
  );
  file = file.replace(
    /<A href="([^>]*?)" ([^>]*?) CLASS="XRef"><Link>([^>]*?)<\/Link>(.*?)<\/A>/gs,
    '<xref href="$1"><linktext>$3</linktext>$4</xref>'
  );
  file = file.replace(
    /<A href="([^>]*?)" ([^>]*?) CLASS="XRef">(.*?)<\/A>/gs,
    '<xref href="$1">$3</xref>'
  );
  file = file.replace(
    /<A ([^>]*?) CLASS="XRef">([^>]*?)<\/A>/gs,
    "<xref $1>$2</xref>"
  );
  file = file.replace(
    /<A href="([^>]*?)" ([^>]*?) CLASS="footnote">(.*?)<\/A>/gs,
    '<xref href="$1">$3</xref>'
  );
  file = file.replace(/<xref href="(.*?)#id\((.*?)\)"/gs, '<xref href="$2"');
  file = file.replace(/<Link>/gs, "");
  file = file.replace(/<\/Link>/gs, "");

  // Heading/Topic generation
  file = file.replace(
    /<Heading-([0-9]+)>/gs,
    "</topic>\n<topic type=\"$1\"><title>"
  );
  file = file.replace(/<\/Heading-([0-9]+)>/gs, "</title>");
  file = file.replace(
    /<H-([0-9]+)>/gs,
    "</topic>\n<topic type=\"$1\"><title>"
  );
  file = file.replace(/<\/H-([0-9]+)>/gs, "</title>");
  file = file.replace(
    /<H([0-9]+)>/gs,
    "</topic>\n<topic type=\"$1\"><title>"
  );
  file = file.replace(/<\/H([0-9]+)>/gs, "</title>");
  file = file.replace(
    /<Head([0-9]+)>/gs,
    "</topic>\n<topic type=\"$1\"><title>"
  );
  file = file.replace(/<\/Head([0-9]+)>/gs, "</title>");

  file = file.replace(/<H0X-AppendixNum>/gs, "</topic>\n<topic type=\"1\"><title>");
  file = file.replace(/<\/H0X-AppendixNum>/gs, "</title>");
  file = file.replace(/<H0CN-ChapNum>/gs, "</topic>\n<topic type=\"1\"><title>");
  file = file.replace(/<\/H0CN-ChapNum>/gs, "</title>");
  file = file.replace(/<H2NoBreakHTML>/gs, "</topic>\n<topic type=\"2\"><title>");
  file = file.replace(/<\/H2NoBreakHTML>/gs, "</title>");
  file = file.replace(/<H3NoBreakHTML>/gs, "</topic>\n<topic type=\"3\"><title>");
  file = file.replace(/<\/H3NoBreakHTML>/gs, "</title>");
  file = file.replace(/<H0X-AppendixNum>/gs, "</topic>\n<topic type=\"1\"><title>");
  file = file.replace(/<\/H0X-AppendixNum>/gs, "</title>");
  file = file.replace(
    /<EC-Heading-([0-9]+)>/gs,
    "</topic>\n<topic type=\"$1\"><title>"
  );
  file = file.replace(/<\/EC-Heading-([0-9]+)>/gs, "</title>");

  file = file.replace(
    /<WorkstepTitle>/gs,
    "</topic>\n<topic type=\"3\" base=\"task\"><title>"
  );
  file = file.replace(/<\/WorkstepTitle>/gs, "</title>");

  file = file.replace(/<HR-RunIn>/gs, "</topic>\n<topic type=\"4\"><title>");
  file = file.replace(/<\/HR-RunIn>/gs, "</title>");

  file = file.replace(
    /<Heading-1-DIA-HYD>/gs,
    "</topic>\n<topic type=\"1\"><title>"
  );
  file = file.replace(/<\/Heading-1-DIA-HYD>/gs, "</title>");

  file = file.replace(/<title><b>(.*?)<\/b><\/title>/gs, "<title>$1</title>");

  // Topic processing
  file = file.replace(/<topics>\s+<\/topic>/gs, `<topics folder="${folder}">`);

  let topicCounter = 1;
  const topicPattern =
    /<topic type="([0-9]+)"([^>]*?)><title>(.*?)<\/title>/s;
  while (topicPattern.test(file)) {
    const match = file.match(topicPattern);
    if (!match) break;

    let title = match[3].toLowerCase();
    folder = folder.toLowerCase();
    folder = folder.replace(/ /g, "_");
    folder = folder.replace(/\./g, "_");

    title = title.replace(/,/g, "");
    title = title.replace(/:/g, "");
    title = title.replace(/\(/g, "");
    title = title.replace(/\)/g, "");
    title = title.replace(/\//g, "_");
    title = title.replace(/ - /g, "_");
    title = title.replace(/ /g, "_");
    title = title.replace(/<div>/g, "");
    title = title.replace(/<_div>/g, "");
    title = title.replace(/<image_([^>]*?)>/g, "");
    title = title.replace(/<a_id([^>]*?)>/g, "");
    title = title.replace(/<bold>/g, "");
    title = title.replace(/<_bold>/g, "");
    title = title.replace(/<strong>/g, "");
    title = title.replace(/<_strong>/g, "");
    title = title.replace(/<italic>/g, "");
    title = title.replace(/<_italic>/g, "");
    title = title.replace(/&lt;/g, "");
    title = title.replace(/&gt;/g, "");

    title = title.replace(/\s+/gs, "");
    let title1 = title.substring(0, 30);
    title1 = title1.replace(/_$/gs, "");

    file = file.replace(
      topicPattern,
      `<new_topic type="${match[1]}" id="${folder}-topic-${topicCounter}"${match[2]} filename="${title1}"><title>${match[3]}</ti>`
    );
    topicCounter++;
  }
  file = file.replace(/<new_topic /gs, "<topic ");
  file = file.replace(/<\/ti>/gs, "</title>");

  // Begin List ================================================
  // LISTINGS
  file = file.replace(
    /<LSI-ListStemIntroList>(.*?)<\/LSI-ListStemIntroList>/gs,
    (m, list) => {
      let listLocal = list;
      listLocal = listLocal.replace(/<LN1-Num1>/gs, "<p>");
      listLocal = listLocal.replace(/<\/LN1-Num1>/gs, "</p>");
      return `<lst>${listLocal}</lst>`;
    }
  );

  // List-BulletList
  file = file.replace(
    /<List-BulletList>(.*?)<\/List-BulletList>/gs,
    (m, listBul) => {
      let listLocal = listBul;
      listLocal = listLocal.replace(/<List-Bullet>/gs, '<li type="bull1">');
      listLocal = listLocal.replace(/<\/List-Bullet>/gs, "</li>");

      listLocal = listLocal.replace(/<List-Dash>/gs, "<ul1><li1>");
      listLocal = listLocal.replace(/<\/List-Dash>/gs, "</li1></ul1>");
      listLocal = listLocal.replace(/<\/li1><\/ul1>\n+<ul><li1>/gs, "</li>\n<li>");
      listLocal = listLocal.replace(/<ul>/gs, '<ul type="dash">');
      listLocal = listLocal.replace(/<li1>/gs, '<li type="bull2">');
      listLocal = listLocal.replace(/<\/li1><\/ul1>/gs, "</li></ul>");

      listLocal = listLocal.replace(/<Body-Note>/gs, "<NOTE>");
      listLocal = listLocal.replace(/<\/Body-Note>/gs, "</NOTE>");
      listLocal = listLocal.replace(
        /<WorkstepResult>/gs,
        '<li type="WorkstepResult">'
      );
      listLocal = listLocal.replace(/<\/WorkstepResult>/gs, "</li>");
      listLocal = listLocal.replace(
        /<WorkstepResult([0-9]+)>/gs,
        '<li type="WorkstepResult$1">'
      );
      listLocal = listLocal.replace(/<\/WorkstepResult([0-9]+)>/gs, "</li>");

      return `<ul level="1">${listLocal}</ul>`;
    }
  );

  // List-BulletList (alternate)
  file = file.replace(
    /<List-BulletList>(.*?)<\/List-BulletList>/gs,
    (m, bul1) => {
      let listLocal = bul1;
      listLocal = listLocal.replace(/<LB1-Bullet1>/gs, '<li type="bull1">');
      listLocal = listLocal.replace(/<\/LB1-Bullet1>/gs, "</li>");
      return `<ul level="1">${listLocal}</ul>`;
    }
  );

  // LB1-Bullet1List
  file = file.replace(
    /<LB1-Bullet1List>(.*?)<\/LB1-Bullet1List>/gs,
    (m, bul1) => {
      let listLocal = bul1;
      listLocal = listLocal.replace(/<List-Bullet>/gs, "<ul-li1>");
      listLocal = listLocal.replace(/<\/List-Bullet>/gs, "</ul-li1>");
      listLocal = listLocal.replace(/<LB1-Bullet1>/gs, "<ul-li1>");
      listLocal = listLocal.replace(/<\/LB1-Bullet1>/gs, "</ul-li1>");
      listLocal = listLocal.replace(/<ul-li1>/gs, '<li type="bull1">');
      return `<ul level="1">${listLocal}</ul>`;
    }
  );

  // LB3-Bullet3List
  file = file.replace(
    /<LB3-Bullet3List>(.*?)<\/LB3-Bullet3List>/gs,
    (m, bul3) => {
      let listLocal = bul3;
      listLocal = listLocal.replace(/<LB3-Bullet3>/gs, "<ul-li3>");
      listLocal = listLocal.replace(/<\/LB3-Bullet3>/gs, "</ul-li3>");

      listLocal = listLocal.replace(/<LN1-Num1>/gs, "<ol1><ol-li1>");
      listLocal = listLocal.replace(/<\/LN1-Num1>/gs, "</ol-li1></ol1>");

      listLocal = listLocal.replace(
        /<\/ol-li1><\/ol1>\n<ol1><ol-li1>/gs,
        "</ol-li1>\n<ol-li1>"
      );

      listLocal = listLocal.replace(/<ol-li1>/gs, '<list-item type="num1">');
      listLocal = listLocal.replace(/<\/ol-li1>/gs, "</list-item>");
      listLocal = listLocal.replace(/<ol1>/gs, "<ol level=\"1\">\n");
      listLocal = listLocal.replace(/<\/ol1>/gs, "\n</ol>");

      listLocal = listLocal.replace(/<ul-li1>/gs, '<li type="bull1">');
      listLocal = listLocal.replace(/<ul-li3>/gs, '<li type="bull3">');

      return `<ul level="3">${listLocal}</ul>`;
    }
  );

  // Bullet3List
  file = file.replace(
    /<Bullet3List>(.*?)<\/Bullet3List>/gs,
    (m, bul3) => {
      let listLocal = bul3;
      listLocal = listLocal.replace(/<List-Bullet>/gs, "<ul-li1>");
      listLocal = listLocal.replace(/<\/List-Bullet>/gs, "</ul-li1>");
      listLocal = listLocal.replace(/<LB1-Bullet1>/gs, "<ul-li1>");
      listLocal = listLocal.replace(/<\/LB1-Bullet1>/gs, "</ul-li1>");
      listLocal = listLocal.replace(/<LB3-Bullet3>/gs, "<ul-li3>");
      listLocal = listLocal.replace(/<\/LB3-Bullet3>/gs, "</ul-li3>");

      return `<ul level="3">${listLocal}</ul>`;
    }
  );

  // List-DashList
  file = file.replace(
    /<List-DashList>(.*?)<\/List-DashList>/gs,
    (m, dash2) => {
      let listLocal = dash2;
      listLocal = listLocal.replace(/<List-Dash>/gs, "<ul-li2>");
      listLocal = listLocal.replace(/<\/List-Dash>/gs, "</ul-li2>");
      return `<ul level="1" type="dash">${listLocal}</ul>`;
    }
  );

  // LD2-Dash2List
  file = file.replace(
    /<LD2-Dash2List>(.*?)<\/LD2-Dash2List>/gs,
    (m, dash2) => {
      let listLocal = dash2;
      listLocal = listLocal.replace(/<LD2-Dash2>/gs, "<ul-li2>");
      listLocal = listLocal.replace(/<\/LD2-Dash2>/gs, "</ul-li2>");
      return `<ul level="2" type="dash">${listLocal}</ul>`;
    }
  );

  // LD4-Dash4List
  file = file.replace(
    /<LD4-Dash4List>(.*?)<\/LD4-Dash4List>/gs,
    (m, dash4) => {
      let listLocal = dash4;
      listLocal = listLocal.replace(/<LD4-Dash4>/gs, "<ul-li4>");
      listLocal = listLocal.replace(/<\/LD4-Dash4>/gs, "</ul-li4>");
      return `<ul level="4" type="dash">${listLocal}</ul>`;
    }
  );

  // List-Num1List
  file = file.replace(
    /<List-Num1List>(.*?)<\/List-Num1List>/gs,
    (m, list1) => {
      let listLocal = list1;
      listLocal = listLocal.replace(/<List-Num1>/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num1>/gs, "</ol-li1>");
      listLocal = listLocal.replace(/<List-Num->/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num->/gs, "</ol-li1>");
      listLocal = listLocal.replace(/<List-Bullet>/gs, "<ula><ul-li1>");
      listLocal = listLocal.replace(/<\/List-Bullet>/gs, "</ul-li1></ula>");

      listLocal = listLocal.replace(
        /<\/ul-li1><\/ula>\n<ula><ul-li1>/gs,
        "</ul-li0>\n<ul-li1>"
      );
      listLocal = listLocal.replace(/<ula>/gs, '<ul level="2">');
      listLocal = listLocal.replace(/<\/ula>/gs, "");

      return `<ol level="1">${listLocal}</ol>`;
    }
  );

  // LN1-Num1List
  file = file.replace(
    /<LN1-Num1List>(.*?)<\/LN1-Num1List>/gs,
    (m, list1) => {
      let listLocal = list1;
      listLocal = listLocal.replace(/<List-Num1>/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num1>/gs, "</ol-li1>");
      listLocal = listLocal.replace(/<List-Num->/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num->/gs, "</ol-li1>");

      listLocal = listLocal.replace(/<LN1-Num1>/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/LN1-Num1>/gs, "</ol-li1>");
      listLocal = listLocal.replace(/<LN1-Num->/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/LN1-Num->/gs, "</ol-li1>");

      listLocal = listLocal.replace(/<List-Bullet>/gs, "<ul><ul-li1>");
      listLocal = listLocal.replace(/<\/List-Bullet>/gs, "</ul-li1></ul>");
      listLocal = listLocal.replace(/<LB2-Bullet2>/gs, "<ulb><ul-li2>");
      listLocal = listLocal.replace(/<\/LB2-Bullet2>/gs, "</ul-li2></ulb>");
      listLocal = listLocal.replace(/<LB3-Bullet3>/gs, "<ulc><ul-li3>");
      listLocal = listLocal.replace(/<\/LB3-Bullet3>/gs, "</ul-li3></ulc>");
      listLocal = listLocal.replace(/<LA2-Alpha2>/gs, "<ola><ol-li2>");
      listLocal = listLocal.replace(/<\/LA2-Alpha2>/gs, "</ol-li2></ola>");
      listLocal = listLocal.replace(/<LD2-Dash2>/gs, "<ul-dash><ul-li2>");
      listLocal = listLocal.replace(/<\/LD2-Dash2>/gs, "</ul-li2></ul-dash>");

      listLocal = listLocal.replace(/<LD3-Dash3>/gs, "<ul-dash3><ul-li3>");
      listLocal = listLocal.replace(/<\/LD3-Dash3>/gs, "</ul-li3></ul-dash3>");
      listLocal = listLocal.replace(/<\/ul-dash3>\n<ul-dash3>/gs, "");

      listLocal = listLocal.replace(
        /<\/ul-li0><\/ul>\n<ul2><ul-li1>/gs,
        "</ul-li0>\n<ul-li1>"
      );
      listLocal = listLocal.replace(
        /<\/ol-li2><\/ola>\n<ola><ol-li2>/gs,
        "</ol-li2>\n<ol-li2>"
      );

      listLocal = listLocal.replace(
        /<\/ul-li0><\/ul>\n<ul><ul-li1>/gs,
        "</ul-li0>\n<ul-li1>"
      );
      listLocal = listLocal.replace(
        /<\/ol-lia><\/ul>\n<ul><ol-li2>/gs,
        "</ol-li2>\n<ol-li2>"
      );

      listLocal = listLocal.replace(
        /<\/ul-li2><\/ulb>\n<ulb><ul-li2>/gs,
        "</ul-li2>\n<ul-li2>"
      );

      listLocal = listLocal.replace(
        /<\/ul-li3><\/ulc>\s+<ulc><ul-li3>/gs,
        "</ul-li3>\n<ul-li3>"
      );
      listLocal = listLocal.replace(
        /<\/ul-li2><\/ul-dash>\s+<ul-dash><ul-li2>/gs,
        "</ul-li2>\n<ul-li2>"
      );

      listLocal = listLocal.replace(/<ola>/gs, '<ol level="1" type="a">\n');
      listLocal = listLocal.replace(/<\/ola>/gs, "\n</ol>");
      listLocal = listLocal.replace(/<ulb>/gs, "<ul>\n");
      listLocal = listLocal.replace(/<\/ulb>/gs, "\n</ul>");
      listLocal = listLocal.replace(/<ulc>/gs, "<ul>\n");
      listLocal = listLocal.replace(/<\/ulc>/gs, "\n</ul>");
      listLocal = listLocal.replace(/<ul-dash>/gs, '<ul level="2" type="dash">\n');
      listLocal = listLocal.replace(/<\/ul-dash>/gs, "\n</ul>");

      return `<ol level="1">${listLocal}</ol>`;
    }
  );

  // List-Num-List
  file = file.replace(
    /<List-Num-List>(.*?)<\/List-Num-List>/gs,
    (m, list1) => {
      let listLocal = list1;
      listLocal = listLocal.replace(/<List-Num1>/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num1>/gs, "<ol-li1>");
      return `<ol level="1">${listLocal}</ol>`;
    }
  );

  // LN2-Num2List
  file = file.replace(
    /<LN2-Num2List>(.*?)<\/LN2-Num2List>/gs,
    (m, list2) => {
      let listLocal = list2;
      listLocal = listLocal.replace(/<List-Num2>/gs, "<ol-li2>");
      listLocal = listLocal.replace(/<\/List-Num2>/gs, "<ol-li2>");
      return `<ol level="2">${listLocal}</ol>`;
    }
  );

  // LN2-Num2List (alternate)
  file = file.replace(
    /<LN2-Num2List>(.*?)<\/LN2-Num2List>/gs,
    (m, list2) => {
      let listLocal = list2;
      listLocal = listLocal.replace(/<List-Num1>/gs, "<ol-li1>");
      listLocal = listLocal.replace(/<\/List-Num1>/gs, "</ol-li1>");
      return `<ol level="2">${listLocal}</ol>`;
    }
  );

  // List without parent
  file = file.replace(/<LB2-Bullet2>/gs, "<ul-li2>");
  file = file.replace(/<\/LB2-Bullet2>/gs, "</ul-li2>");

  // List without parent
  file = file.replace(/<LD3-Dash3>/gs, '<li type="dash">');
  file = file.replace(/<\/LD3-Dash3>/gs, "</li>");

  // Without parent
  file = file.replace(/<LN1-Num1>/gs, "<ol-noParent><ol-li1>");
  file = file.replace(/<\/LN1-Num1>/gs, "</ol-li1></ol-noParent>");
  file = file.replace(/<LN1-Num->/gs, "<ol-noParent><ol-li1>");
  file = file.replace(/<\/LN1-Num->/gs, "</ol-li1></ol-noParent>");
  file = file.replace(/<List-Num1>/gs, "<ol-noParent><ol-li1>");
  file = file.replace(/<\/List-Num1>/gs, "</ol-li1></ol-noParent>");
  file = file.replace(/<List-Num->/gs, "<ol-noParent><ol-li1>");
  file = file.replace(/<\/List-Num->/gs, "</ol-li1></ol-noParent>");
  file = file.replace(/<\/ol-noParent>\n<ol-noParent>/gs, "");
  file = file.replace(/<ol-noParent>/gs, '<ol level="1" parent="generated">');
  file = file.replace(/<\/ol-noParent>/gs, "</ol>");

  // Without parent
  file = file.replace(/<LN2-Num2>/gs, "<ol-li2>");
  file = file.replace(/<\/LN2-Num2>/gs, "</ol-li2>");

  // Without parent
  file = file.replace(/<List-Bullet>/gs, "<ul-noParent><ul-li1>");
  file = file.replace(/<\/List-Bullet>/gs, "</ul-li1></ul-noParent>");
  file = file.replace(/<\/ul-noParent>\n<ul-noParent>/gs, "");
  file = file.replace(/<ul-noParent>/gs, "");
  file = file.replace(/<\/ul-noParent>/gs, "");

  // List without parent
  file = file.replace(/<List-Dash>/gs, "<ul-dash><ul-li1>");
  file = file.replace(/<\/List-Dash>/gs, "</ul-li1></ul-dash>");
  file = file.replace(/<\/ul-dash>\n<ul-dash>/gs, "");
  file = file.replace(/<ul-dash>/gs, '<ul level="1" type="dash">');
  file = file.replace(/<\/ul-dash>/gs, "</ul>");

  file = file.replace(/<LD3-Dash3>/gs, "<ul-dash3><ul-li3>");
  file = file.replace(/<\/LD3-Dash3>/gs, "</ul-li3></ul-dash3>");
  file = file.replace(/<ul-dash3>/gs, "");
  file = file.replace(/<\/ul-dash3>/gs, "");

  // EC-StepList
  file = file.replace(/<EC-StepList>(.*?)<\/EC-StepList>/gs, (m, step) => {
    let local = step;
    local = local.replace(/<EC-Step>/gs, '<li type="step">');
    local = local.replace(/<\/EC-Step>/gs, "</li>");
    return `<ol level="2">${local}</ol>`;
  });
  file = file.replace(/<EC-Step>/gs, '<li type="bull1" style="step">');
  file = file.replace(/<\/EC-Step>/gs, "</li>");
  file = file.replace(/<EC-If>/gs, '<li type="bull2">');
  file = file.replace(/<\/EC-If>/gs, "</li>");
  file = file.replace(/<EC-Then>/gs, '<li type="bull3" style="dash">');
  file = file.replace(/<\/EC-Then>/gs, "</li>");

  file = file.replace(/<ul-li([0-4]+)>\s+/gs, "<ul-li$1>");
  file = file.replace(/<ol-li([0-4]+)>\s+/gs, "<ol-li$1>");

  // Remove OL/UL
  file = file.replace(/<ul-li([0-4]+)>/gs, '<li type="bull$1">');
  file = file.replace(/<ol-li([0-4]+)>/gs, '<list-item type="num$1">');
  file = file.replace(/<\/ul-li([0-4]+)>/gs, "</li>");
  file = file.replace(/<\/ol-li([0-4]+)>/gs, "</list-item>");

  file = file.replace(/<ol([^>].*?)>/gs, "");
  file = file.replace(/<ul([^>].*?)>/gs, "");
  file = file.replace(/<ul>/gs, "");
  file = file.replace(/<\/ul>/gs, "");
  file = file.replace(/<ol>/gs, "");
  file = file.replace(/<\/ol>/gs, "");

  // End List ================================================

  // Workstep1List
  file = file.replace(
    /<Workstep1List>(.*?)<\/Workstep1List>/gs,
    (m, wk) => {
      let local = wk;
      local = local.replace(/<Workstep1>/gs, '<list-item type="num1">');
      local = local.replace(/<Workstep->/gs, '<list-item type="num1">');
      local = local.replace(/<\/Workstep->/gs, "</list-item>");

      local = local.replace(/<List-Bullet>/gs, "<ul><li>");
      local = local.replace(/<\/List-Bullet>/gs, "</li></ul>");
      local = local.replace(/<\/li><\/ul>\n<ul><li>/gs, "</li>\n<li>");
      local = local.replace(/<Body-Note>/gs, "<NOTE>");
      local = local.replace(/<\/Body-Note>/gs, "</NOTE>");
      local = local.replace(
        /<WorkstepResult>/gs,
        '<list-item type="WorkstepResult">'
      );
      local = local.replace(/<\/WorkstepResult>/gs, "</list-item>");
      local = local.replace(
        /<WorkstepResult([0-9]+)>/gs,
        '<list-item type="WorkstepResult$1">'
      );
      local = local.replace(/<\/WorkstepResult([0-9]+)>/gs, "</list-item>");
      return local;
    }
  );

  file = file.replace(/<Workstep1List>/gs, "");
  file = file.replace(/<\/Workstep1List>/gs, "");

  file = file.replace(/<Workstep-List>/gs, "");
  file = file.replace(/<\/Workstep-List>/gs, "");
  file = file.replace(/<Workstep1>/gs, '<list-item type="num1">');
  file = file.replace(/<\/Workstep1>/gs, "</list-item>");
  file = file.replace(/<Workstep->/gs, '<list-item type="num1">');
  file = file.replace(/<\/Workstep->/gs, "</list-item>");
  file = file.replace(
    /<WorkstepResult>/gs,
    '<list-item type="WorkstepResult">'
  );
  file = file.replace(/<\/WorkstepResult>/gs, "</list-item>");
  file = file.replace(
    /<WorkstepResult([0-9]+)>/gs,
    '<list-item type="WorkstepResult$1">'
  );
  file = file.replace(/<\/WorkstepResult([0-9]+)>/gs, "</list-item>");

  // Paragraph generation
  file = file.replace(/<Body>/gs, "<p>");
  file = file.replace(/<\/Body>/gs, "</p>");
  file = file.replace(/<Normal>/gs, "<p>");
  file = file.replace(/<\/Normal>/gs, "</p>");
  file = file.replace(/<Body-bold>/gs, "<p>");
  file = file.replace(/<\/Body-bold>/gs, "</p>");
  file = file.replace(/<LC1-Continue1>/gs, '<p style="lc1-Continue1">');
  file = file.replace(/<\/LC1-Continue1>/gs, "</p>");
  file = file.replace(/<LC2-Continue2>/gs, '<p style="lc2-Continue2">');
  file = file.replace(/<\/LC2-Continue2>/gs, "</p>");
  file = file.replace(/<LC3-Continue3>/gs, '<p style="lc3-Continue2">');
  file = file.replace(/<\/LC3-Continue3>/gs, "</p>");
  file = file.replace(/<LSI-ListStemIntro>/gs, "<p>");
  file = file.replace(/<\/LSI-ListStemIntro>/gs, "</p>");

  file = file.replace(/<Command1>/gs, "<codeblock>");
  file = file.replace(/<\/Command1>/gs, "</codeblock>");
  file = file.replace(/<Command3>/gs, "<codeblock>");
  file = file.replace(/<\/Command3>/gs, "</codeblock>");

  // Inline formatting elements
  file = file.replace(/<Bold>/gs, "<b>");
  file = file.replace(/<\/Bold>/gs, "</b>");
  file = file.replace(/<Strong>/gs, "<b>");
  file = file.replace(/<\/Strong>/gs, "</b>");
  file = file.replace(/<BoldItalic>/gs, "<b><i>");
  file = file.replace(/<\/BoldItalic>/gs, "</i></b>");
  file = file.replace(/<Emphasis>/gs, "<i>");
  file = file.replace(/<\/Emphasis>/gs, "</i>");
  file = file.replace(/<Italic>/gs, "<i>");
  file = file.replace(/<\/Italic>/gs, "</i>");
  file = file.replace(/<superscript>/gs, "<sup>");
  file = file.replace(/<\/superscript>/gs, "</sup>");
  file = file.replace(/<subscript>/gs, "<sub>");
  file = file.replace(/<\/subscript>/gs, "</sub>");

  file = file.replace(/<Command>/gs, "<codeph>");
  file = file.replace(/<\/Command>/gs, "</codeph>");
  file = file.replace(/<ASCIIOutput>/gs, "<codeph>");
  file = file.replace(/<\/ASCIIOutput>/gs, "</codeph>");
  file = file.replace(/<ASCIIOutputVariable>/gs, "<codeph>");
  file = file.replace(/<\/ASCIIOutputVariable>/gs, "</codeph>");
  file = file.replace(/<Input>/gs, "<b>");
  file = file.replace(/<\/Input>/gs, "</b>");

  // Warning/Note handling
  file = file.replace(
    /<Body-NoteList>(.*?)<\/Body-NoteList>/gs,
    (m, bnotes) => {
      let local = bnotes;
      local = local.replace(/<Body-Note>/gs, "<note>");
      local = local.replace(/<\/Body-Note>/gs, "</note>");
      return local;
    }
  );
  file = file.replace(/<Body-Note>/gs, "<NOTE>");
  file = file.replace(/<\/Body-Note>/gs, "</NOTE>");
  file = file.replace(/<Notes>/gs, "<NOTES>");
  file = file.replace(/<\/Notes>/gs, "</NOTES>");

  file = file.replace(
    /<N-NoteList>(.*?)<\/N-NoteList>/gs,
    (m, notes) => {
      let local = notes;
      local = local.replace(/<\/N-Note>/gs, "");
      local = local.replace(/<N-Note>/gs, "");
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      return `<NOTES>${local}</NOTES>`;
    }
  );

  file = file.replace(
    /<N-Note>(.*?)<\/N-Note>/gs,
    (m, note) => {
      let local = note;
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      return `<NOTE>${local}</NOTE>`;
    }
  );
  file = file.replace(/<N-Note>/gs, "<NOTE1>");
  file = file.replace(/<\/N-Note>/gs, "</NOTE1>");

  file = file.replace(
    /<NT-TipList>(.*?)<\/NT-TipList>/gs,
    (m, tip) => {
      let local = tip;
      local = local.replace(/<([\/])?NT-Tip>/gs, "");
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      return `<TIP>${local}</TIP>`;
    }
  );
  file = file.replace(/<NT-Tip>/gs, "<TIP1>");
  file = file.replace(/<\/NT-Tip>/gs, "</TIP1>");

  file = file.replace(
    /<NI-ImportantList>(.*?)<\/NI-ImportantList>/gs,
    (m, imp) => {
      let local = imp;
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      local = local.replace(/<([\/])?NI-Important>/gs, "");
      return `<IMPORTANT>${local}</IMPORTANT>`;
    }
  );
  file = file.replace(/<NI-Important>/gs, "<IMPORTANT1>");
  file = file.replace(/<\/NI-Important>/gs, "</IMPORTANT1>");

  file = file.replace(
    /<NC-CautionList>(.*?)<\/NC-CautionList>/gs,
    (m, caution) => {
      let local = caution;
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      local = local.replace(/<NC-Caution>/gs, "");
      local = local.replace(/<\/NC-Caution>/gs, "");
      return `<CAUTION>${local}</CAUTION>`;
    }
  );

  file = file.replace(
    /<NS-SecurityAlertList>(.*?)<\/NS-SecurityAlertList>/gs,
    (m, att) => {
      let local = att;
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      return `<ATTENTION>${local}</ATTENTION>`;
    }
  );

  file = file.replace(
    /<NW-WarningList>(.*?)<\/NW-WarningList>/gs,
    (m, imp) => {
      let local = imp;
      local = local.replace(/<([\/])?NI-Important>/gs, "");
      local = local.replace(/<NW-Warning>/gs, "<p>");
      local = local.replace(/<\/NW-Warning>/gs, "</p>");
      local = local.replace(/<DIV>(.*?)<\/DIV>/gs, "");
      return `<WARNING>${local}</WARNING>`;
    }
  );
  file = file.replace(/<NW-Warning>/gs, "<WARNING1>");
  file = file.replace(/<\/NW-Warning>/gs, "</WARNING1>");

  // Warning handling with grouping
  file = file.replace(
    /<Warning-Title-([^>]*?)>(.*?)<\/Warning-End>/gs,
    (m, typeRaw, warnBody) => {
      let type = typeRaw.toLowerCase().replace(/caution-damage/gs, "caution");
      let warn = warnBody;

      const nested = warn.match(
        /<Warning-Title-([^>]*?)>(.*?)<Warning-End>/gs
      );
      if (nested) {
        for (const segment of nested) {
          const innerMatch = segment.match(
            /<Warning-Title-([^>]*?)>(.*?)<Warning-End>/s
          );
          if (innerMatch) {
            let warn1 = innerMatch[2].replace(
              /<\/Warning-Title-([^>]*?)>/gs,
              ""
            );
            file = file.replace(
              /<Warning1-Title-([^>]*?)>(.*?)<\/Warning-End>/s,
              `<note1 type="${type}">${warn1}</note1>`
            );
          }
        }
      }

      warn = warn.replace(/<DIV>(.*?)<\/Warning-Title-([^>]*?)>/gs, "");
      warn = warn.replace(/<Warning-End>(.*?)<\/DIV>/gs, "");
      warn = warn.replace(/<\/Warning-Title-([^>]*?)>/gs, "");
      warn = warn.replace(/<Warning-End>/gs, "");

      warn = warn.replace(/<Warning-Text-bold>/gs, "<title>");
      warn = warn.replace(/<\/Warning-Text-bold>/gs, "</title>");
      warn = warn.replace(/<Warning-Text>/gs, "<p>");
      warn = warn.replace(/<\/Warning-Text>/gs, "</p>");
      warn = warn.replace(/<Warning-ToDoList>/gs, '<ul type="to-do-list">');
      warn = warn.replace(/<\/Warning-ToDoList>/gs, "</ul>");
      warn = warn.replace(/<Warning-ToDo>/gs, "<li>");
      warn = warn.replace(/<\/Warning-ToDo>/gs, "</li>");
      warn = warn.replace(/<Warning-BulletList>/gs, '<ul type="to-do-list">');
      warn = warn.replace(/<\/Warning-BulletList>/gs, "</ul>");

      warn = warn.replace(/<Warning-Bullet>/gs, "<li>");
      warn = warn.replace(/<\/Warning-Bullet>/gs, "</li>");
      warn = warn.replace(/<\/li><\/ul1>\n<ul1><li>/gs, "</li>\n<li>");
      warn = warn.replace(/<\/ul1>/gs, "</ul>");
      warn = warn.replace(/<ul1>/gs, "<ul>");

      warn = warn.replace(/<Warning-Title-Warning>/gs, "");

      return `<note type="${type}">${warn}</note>`;
    }
  );
  file = file.replace(/<Warning-Title-Warning>/gs, "");
  file = file.replace(/<\/Warning-Title-Warning>/gs, "");
  file = file.replace(/<Warning-ToDoList>/gs, '<ul type="to-do-list">');
  file = file.replace(/<\/Warning-ToDoList>/gs, "</ul>");
  file = file.replace(/<Warning-ToDo>/gs, "<li>");
  file = file.replace(/<\/Warning-ToDo>/gs, "</li>");

  // Figure coded within table
  file = file.replace(/<TABLE>\s+<CAPTION>/gs, "<FIGURE>");
  file = file.replace(/<TABLE><CAPTION>/gs, "<FIGURE>");
  file = file.replace(/<FIGURE>(.*?)<\/TABLE>/gs, (m, fig) => {
    let local = fig;
    local = local.replace(/<Figure-Anchor>/gs, "");
    local = local.replace(/<\/Figure-Anchor>/gs, "");
    local = local.replace(/<DIV>\s+<IMAGE([^>]*?)\/>\s+<\/DIV>/gs, "<IMAGE$1/>");
    local = local.replace(/<DIV>/gs, "");
    local = local.replace(/<\/DIV>/gs, "");
    local = local.replace(/<ROW>/gs, "");
    local = local.replace(/<\/ROW>/gs, "");
    local = local.replace(/<\/CELL>/gs, "");
    local = local.replace(/<\/CAPTION>/gs, "");
    local = local.replace(/<CELL([^>]*?)>/gs, "");

    local = local.replace(/<Figure-Title>/gs, "<title>");
    local = local.replace(/<\/Figure-Title>/gs, "</title>");
    local = local.replace(/<Figure-Number>/gs, "<title>");
    local = local.replace(/<\/Figure-Number>/gs, "</title>");
    local = local.replace(/<Figure-Text>/gs, "<title>");
    local = local.replace(/<\/Figure-Text>/gs, "</title>");
    local = local.replace(/<p>/gs, "<title>");
    local = local.replace(/<\/p>/gs, "</title>");

    return `<fig>${local}</fig>`;
  });

  // Table
  file = file.replace(/<TH-TableHeading>/gs, "");
  file = file.replace(/<\/TH-TableHeading>/gs, "");
  file = file.replace(/<TB-TableBody>/gs, "");
  file = file.replace(/<\/TB-TableBody>/gs, "");
  file = file.replace(/<TB-TableBodyList>/gs, "");
  file = file.replace(/<\/TB-TableBodyList>/gs, "");
  file = file.replace(/<entry-TableHeadingList>/gs, "");
  file = file.replace(/<\/entry-TableHeadingList>/gs, "");
  file = file.replace(/<TH-TableHeadingList>/gs, "");
  file = file.replace(/<\/TH-TableHeadingList>/gs, "");

  let tableCounter = 1;
  file = file.replace(/<TABLE>(.*?)<\/TABLE>/gs, (m, table) => {
    let local = table;

    folder = folder.toLowerCase().replace(/ /g, "_").replace(/\./g, "_");

    local = local.replace(/\s+<TableTitle-white>\s+/gs, "<TableTitle-white>");
    local = local.replace(/\s+<TableTitle-white-Left>\s+/gs, "<TableTitle-white-Left>");
    local = local.replace(
      /\s+<TableTitle-white-Center>\s+/gs,
      "<TableTitle-white-Center>"
    );
    local = local.replace(
      /\s+<TableText-Center-Middle>\s+/gs,
      "<TableText-Center-Middle>"
    );
    local = local.replace(/\s+<TableText-Center>\s+/gs, "<TableText-Center>");
    local = local.replace(/\s+<TableText-Left>\s+/gs, "<TableText-Left>");
    local = local.replace(/\s+<TableText-Center>\s+/gs, "<TableText-Center>");
    local = local.replace(/\s+<TableText-Middle>\s+/gs, "<TableText-Middle>");
    local = local.replace(
      /\s+<TableTitle-black-Center>\s+/gs,
      "<TableTitle-black-Center>"
    );
    local = local.replace(
      /\s+<TableTitle-black-Left>\s+/gs,
      "<TableTitle-black-Left>"
    );
    local = local.replace(
      /\s+<TBC-TableBodyCentered>\s+/gs,
      "<TBC-TableBodyCentered>"
    );

    local = local.replace(/<\/TableTitle-white>\s+/gs, "</TableTitle-white>");
    local = local.replace(
      /<\/TableTitle-white-Left>\s+/gs,
      "</TableTitle-white-Left>"
    );
    local = local.replace(
      /<\/TableTitle-white-Center>\s+/gs,
      "</TableTitle-white-Center>"
    );
    local = local.replace(
      /<\/TableText-Center-Middle>\s+/gs,
      "</TableText-Center-Middle>"
    );
    local = local.replace(/<\/TableText-Center>\s+/gs, "</TableText-Center>");
    local = local.replace(/<\/TableText-Left>\s+/gs, "</TableText-Left>");
    local = local.replace(/<\/TableText-Middle>\s+/gs, "</TableText-Middle>");
    local = local.replace(
      /<\/TableTitle-black-Center>\s+/gs,
      "</TableTitle-black-Center>"
    );
    local = local.replace(
      /<\/TableTitle-black-Left>\s+/gs,
      "</TableTitle-black-Left>"
    );
    local = local.replace(
      /<\/TBC-TableBodyCentered>\s+/gs,
      "</TBC-TableBodyCentered>"
    );

    local = local.replace(/<\/TableTitle-white><TableTitle-white>/gs, " ");
    local = local.replace(
      /<\/TableTitle-white-Left><TableTitle-white-Left>/gs,
      " "
    );
    local = local.replace(
      /<\/TableTitle-white-Center><TableTitle-white-Center>/gs,
      " "
    );
    local = local.replace(
      /<\/TableText-Center-Middle><TableText-Center-Middle>/gs,
      " "
    );
    local = local.replace(/<\/TableText-Center><TableText-Center>/gs, " ");
    local = local.replace(/<\/TableText-Left><TableText-Left>/gs, " ");
    local = local.replace(/<\/TableText-Middle><TableText-Middle>/gs, " ");
    local = local.replace(
      /<\/TableTitle-black-Center><TableTitle-black-Center>/gs,
      " "
    );
    local = local.replace(
      /<\/TableTitle-black-Left><TableTitle-black-Left>/gs,
      " "
    );
    local = local.replace(
      /<\/TBC-TableBodyCentered><TBC-TableBodyCentered>/gs,
      " "
    );

    local = local.replace(/<\/TableText-Center-Middle>/gs, "");
    local = local.replace(/<\/TableTitle-white-Center>/gs, "");
    local = local.replace(/<\/TableTitle-white-Left>/gs, "");
    local = local.replace(/<\/TableText-Center>/gs, "");
    local = local.replace(/<\/TableText-Left>/gs, "");
    local = local.replace(/<\/TableText-Middle>/gs, "");
    local = local.replace(/<\/TableTitle-black-Center>/gs, "");
    local = local.replace(/<\/TableTitle-black-Left>/gs, "");
    local = local.replace(/<\/TBC-TableBodyCentered>/gs, "");

    local = local.replace(/ ROWSPAN="1"/gs, "");
    local = local.replace(/ COLSPAN="1"/gs, "");
    local = local.replace(/ ROWSPAN/gs, " rowspan");
    local = local.replace(/ COLSPAN/gs, " colspan");
    local = local.replace(/<ROW>/gs, "<row>");
    local = local.replace(/<\/ROW>/gs, "</row>");
    local = local.replace(/<CELL>/gs, "<entry>");
    local = local.replace(/<CELL([^>]*?)>/gs, "<entry$1>");
    local = local.replace(/<\/CELL>/gs, "</entry>");
    local = local.replace(/<TH>/gs, '<entry type="thead">');
    local = local.replace(/<TH([^>]*?)>/gs, '<entry type="thead"$1>');
    local = local.replace(/<\/TH>/gs, "</entry>");
    local = local.replace(/<TH>/gs, "<entry>");
    local = local.replace(/<\/TH>/gs, "</entry>");
    local = local.replace(/<\/TH>/gs, "</entry>");

    local = local.replace(/<TF([^>]*?)>/gs, "<entry$1>");
    local = local.replace(/<\/TF>/gs, "</entry>");
    local = local.replace(
      /<entry([^>]*?)><TableText-Center-Middle>/gs,
      '<entry$1 align="center" valign="middle">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableText-Center-Middle>/gs,
      '<entry$1 align="center" valign="middle">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableTitle-white-Center>/gs,
      '<entry type="thead"$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableTitle-white-Center>/gs,
      '<entry type="thead"$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableTitle-white-Left>/gs,
      '<entry type="thead"$1 align="left">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableTitle-white-Left>/gs,
      '<entry type="thead"$1 align="left">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableText-Center>/gs,
      '<entry$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableText-Center>/gs,
      '<entry$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)><TBC-TableBodyCentered>/gs,
      '<entry$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)>\d+<TBC-TableBodyCentered>/gs,
      '<entry$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableText-Left>/gs,
      '<entry$1 align="left">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableText-Left>/gs,
      '<entry$1 align="left">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableText-Middle>/gs,
      '<entry$1 valign="middle">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableText-Middle>/gs,
      '<entry$1 valign="middle">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableTitle-black-Center>/gs,
      '<entry type="thead"$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableTitle-black-Center>/gs,
      '<entry type="thead"$1 align="center">'
    );
    local = local.replace(
      /<entry([^>]*?)><TableTitle-black-Left>/gs,
      '<entry type="thead"$1 align="left">'
    );
    local = local.replace(
      /<entry([^>]*?)>\s+<TableTitle-black-Left>/gs,
      '<entry type="thead"$1 align="left">'
    );

    local = local.replace(/ type="thead" type="thead"/gs, ' type="thead"');

    // thead creation
    if (/<row>(.*?)<\/row>/gs.test(local)) {
      const rows = Array.from(local.matchAll(/<row>(.*?)<\/row>/gs));
      const hasThead = rows.some((row) => / type="thead"/i.test(row[1]));
      if (hasThead) {
        local = local.replace(
          /<row>(.*?)<\/row>/s,
          "<thead><new_row>$1</new_row></thead>"
        );
      }
    }
    local = local.replace(/<new_row>/gs, "\n<row>");
    local = local.replace(/<\/new_row>/gs, "</row>");

    local = local.replace(/<entry([^>]*?)><thead>/gs, "<thead><entry$1>");
    local = local.replace(/<\/thead><\/entry>/gs, "</entry></thead>");
    local = local.replace(/<row><thead>/gs, "<thead>\n<row>");
    local = local.replace(/<row>\n<thead>/gs, "<thead>\n<row>");
    local = local.replace(/<row>\s+<thead>/gs, "<thead>\n<row>");
    local = local.replace(/<\/thead>\n<thead>/gs, "\n");
    local = local.replace(/<\/thead>\s+<thead>/gs, "\n");
    local = local.replace(/<\/thead><thead>/gs, "\n");

    // tbody creation
    local = local.replace(/<\/thead>/gs, "\n</thead>\n<tbody>");
    local = local.replace(/ type="thead"/gs, "");

    local = local.replace(/<Footnote>/gs, "<p>");
    local = local.replace(/<\/Footnote>/gs, "</p>");
    local = local.replace(/<TableFootnote>/gs, "<p>");
    local = local.replace(/<\/TableFootnote>/gs, "</p>");
    local = local.replace(/<Legend-Text>/gs, "");
    local = local.replace(/<\/Legend-Text>/gs, "");
    local = local.replace(/<entry([^>]*?)>\s+/gs, "<entry$1>");
    local = local.replace(/\s+<\/entry>/gs, "</entry>");

    local = local.replace(/<TableText-Left>/gs, " ");

    // inline figure coded within entry
    local = local.replace(/<entry>(.*?)<\/entry>/gs, (mm, img) => {
      let inner = img;
      inner = inner.replace(
        /<DIV>(.*?)<\/DIV>\n<Figure-Title>(.*?)<\/Figure-Title>/gs,
        "<fig><title>$2</title>$1</fig>"
      );
      inner = inner.replace(
        /<IMAGE ([^>]*?) href="([^>]*?)"([^>]*?)\/>/gs,
        '<image href="$2"/>'
      );
      inner = inner.replace(/<Figure-Title>/gs, "<title>");
      inner = inner.replace(/<\/Figure-Title>/gs, "</title>");
      return `<new_entry>${inner}</new_entry>`;
    });
    local = local.replace(/<new_entry>/gs, "<entry>");
    local = local.replace(/<\/new_entry>/gs, "</entry>");

    // para handling within entry
    local = local.replace(
      /<entry([^>]*?)>(.*?)<\/entry>/gs,
      (mm, attrs, body) => {
        if (/<p>/i.test(body)) {
          return `<new_entry${attrs}>${body}</new_entry>`;
        }
        return `<new_entry${attrs}><p>${body}</p></new_entry>`;
      }
    );
    local = local.replace(/<new_entry/gs, "\n<entry");
    local = local.replace(/<\/new_entry>/gs, "</entry>");

    const result = `<table id="${folder}-table-${tableCounter}">${local}</tbody>\n</table>`;
    tableCounter++;
    return result;
  });

  file = file.replace(/<table([^>]*?)><row>/gs, "<table$1><tbody>\n<row>");
  file = file.replace(/<table([^>]*?)>\s+<row>/gs, "<table$1>\n<tbody>\n<row>");

  file = file.replace(/<FOOTNOTES>/gs, "<fn-group>");
  file = file.replace(/<\/FOOTNOTES>/gs, "</fn-group>");
  file = file.replace(/<Footnote>/gs, "<fn>");
  file = file.replace(/<\/Footnote>/gs, "</fn>");

  file = file.replace(/<DIV>/gs, "<fig>");
  file = file.replace(/<\/DIV>/gs, "</fig>");
  file = file.replace(
    /<IMAGE ([^>]*?) href="([^>]*?)"([^>]*?)\/>/gs,
    '<image href="$2"/>'
  );
  file = file.replace(/<Figure-Number>/gs, "");
  file = file.replace(
    /<\/fig>\n+<Figure-Title>(.*?)<\/Figure-Title>/gs,
    "<title>$1</title></fig>"
  );

  file = file.replace(/<\/Figure-Number>/gs, "");
  file = file.replace(/<Figure-Anchor>/gs, "");
  file = file.replace(/<\/Figure-Anchor>/gs, "");
  file = file.replace(/<([\/])?Anchor>/gs, "");
  file = file.replace(/<([\/])?Reduce1pt>/gs, "");
  file = file.replace(/<([\/])?Default-font>/gs, "");
  file = file.replace(/<Figure-Text>/gs, "");
  file = file.replace(/<\/Figure-Text>/gs, "");
  file = file.replace(/<EventCodeAnchorRight>/gs, "");
  file = file.replace(/<\/EventCodeAnchorRight>/gs, "");

  file = file.replace(/( )+<\/li>/gs, "</li>");
  file = file.replace(/( )+<\/p>/gs, "</p>");
  file = file.replace(/<p>( )+/gs, "<p>");

  file = file.replace(/<b>\n/gs, "<b>");
  file = file.replace(/<\/b>\n/gs, "</b>");
  file = file.replace(/<i>\n/gs, "<i>");
  file = file.replace(/<\/i>\n/gs, "</i>");
  file = file.replace(/<sup>\n/gs, "<sup>");
  file = file.replace(/<\/sup>\n/gs, "</sup>");
  file = file.replace(/<sub>\n/gs, "<sub>");
  file = file.replace(/<\/sub>\n/gs, "</sub>");
  file = file.replace(/<codeph>\n/gs, "<codeph>");
  file = file.replace(/<\/codeph>\n/gs, "</codeph>");
  file = file.replace(/<a id="([0-9]+)"\/>\n/gs, '<a id="$1"/>');

  file = file.replace(/<p([^>]*?)>\s+/gs, "<p$1>");
  file = file.replace(/<p><\/p>/gs, "");
  file = file.replace(/<li([^>]*?)>\s+/gs, "<li$1>");
  file = file.replace(/\s+<topics /gs, "<topics ");
  file = file.replace(/<warning([^>]*?)>\s+/gs, "<warning$1>");
  file = file.replace(/<to-do>\s+/gs, "<to-do>");
  file = file.replace(/\s+<\/fig>/gs, "</fig>");
  file = file.replace(/<fig>\s+/gs, "\n<fig>");
  file = file.replace(/<\/note>/gs, "</note>\n");
  file = file.replace(/<\/ul>/gs, "</ul>\n");
  file = file.replace(
    /<title>\s+<b>(.*?)<\/b><\/title>/gs,
    "<title>$1</title>"
  );

  file = file.replace(/\s+<\/title>/gs, "</title>");
  file = file.replace(/<\/linktext>\s+/gs, "</linktext> ");
  file = file.replace(/<\/note>/gs, "</note>\n");
  file = file.replace(/<\/ul>\s+<p>/gs, "</ul>\n<p>");
  file = file.replace(/  /gs, " ");

  file = file.replace(
    /<topic([^>]*?)><title>(.*?)<\/title>/gs,
    "<topic$1>\n<title>$2</title>\n<body>"
  );
  file = file.replace(/<\/topic>/gs, "</body>\n</topic>");
  file = file.replace(/<title>\s+/gs, "\n<title>");

  file = file.replace(/\n\n\n/gs, "");
  file = file.replace(/\n\n/gs, "\n");

  return { file, folder };
}

function idGeneration(file, folder) {
  let bodyCounter = 1;
  const bodyPattern = /<body11>(.*?)<\/body11>/s;
  while (bodyPattern.test(file)) {
    folder = folder.toLowerCase().replace(/ /g, "_").replace(/\./g, "_");
    file = file.replace(
      /<body>(.*?)<\/body>/s,
      `<new_body id="${folder}-body-${bodyCounter}">$1</new_body>`
    );
    bodyCounter++;
  }
  file = file.replace(/<new_body/gs, "<body");
  file = file.replace(/<\/new_body>/gs, "</body>");

  let figureCounter = 1;
  const figPattern = /<fig>(.*?)<\/fig>/s;
  while (figPattern.test(file)) {
    folder = folder.toLowerCase().replace(/ /g, "_").replace(/\./g, "_");
    file = file.replace(
      /<fig>(.*?)<\/fig>/s,
      `<new_fig id="${folder}-fig-${figureCounter}">$1</new_fig>`
    );
    figureCounter++;
  }
  file = file.replace(/<new_fig/gs, "<fig");
  file = file.replace(/<\/new_fig>/gs, "</fig>");

  let paraCounter = 1;
  const pPattern = /<p111>(.*?)<\/p>/s;
  while (pPattern.test(file)) {
    folder = folder.toLowerCase().replace(/ /g, "_").replace(/\./g, "_");
    file = file.replace(
      /<p>(.*?)<\/p>/s,
      `<new_p id="${folder}-para-${paraCounter}">$1</new_p>`
    );
    paraCounter++;
  }
  file = file.replace(/<new_p/gs, "<p");
  file = file.replace(/<\/new_p>/gs, "</p>");

  return file;
}

function avayaHandling(file) {
  file = file.replace(
    /<TIP1>\s+<\/TIP1>\s+<fig><image href="([^>]*?)"\/><\/fig>(.*?)<\/ul>/gs,
    "<TIP1>$2</TIP1></ul>"
  );
  file = file.replace(
    /<IMPORTANT1>\s+<\/IMPORTANT1>\s+<fig><image href="([^>]*?)"\/><\/fig>(.*?)<\/ul>/gs,
    "<IMPORTANT>$2</IMPORTANT></ul>"
  );
  file = file.replace(
    /<TIP>\s+<fig><image href="([^>]*?)"\/><\/fig>(.*?)<\/TIP>/gs,
    "<TIP>$2</TIP>"
  );
  file = file.replace(
    /<NOTE>\s+<\/NOTE>\s+<fig><image href="([^>]*?)"\/><\/fig>(.*?)<\/([oluts]+)>/gs,
    "<NOTE>$2</NOTE></$3>"
  );

  file = file.replace(/<WARNING>/gs, '<note type="warning">');
  file = file.replace(/<\/WARNING>/gs, "</note>");
  file = file.replace(/<WARNING1>/gs, '<note type="warning">');
  file = file.replace(/<\/WARNING1>/gs, "</note>");
  file = file.replace(/<CAUTION>/gs, '<note type="caution">');
  file = file.replace(/<\/CAUTION>/gs, "</note>");
  file = file.replace(/<CAUTION1>/gs, '<note type="caution">');
  file = file.replace(/<\/CAUTION1>/gs, "</note>");
  file = file.replace(/<ATTENTION>/gs, '<note type="attention">');
  file = file.replace(/<\/ATTENTION>/gs, "</note>");
  file = file.replace(/<NOTES>/gs, '<note type="note">');
  file = file.replace(/<\/NOTES>/gs, "</note>");
  file = file.replace(/<NOTE>/gs, '<note type="note">');
  file = file.replace(/<\/NOTE>/gs, "</note>");
  file = file.replace(/<TIP>/gs, '<note type="tip">');
  file = file.replace(/<\/TIP>/gs, "</note>");
  file = file.replace(/<TIP1>/gs, '<note type="tip">');
  file = file.replace(/<\/TIP1>/gs, "</note>");
  file = file.replace(/<IMPORTANT>/gs, '<note type="important">');
  file = file.replace(/<\/IMPORTANT>/gs, "</note>");
  file = file.replace(/<IMPORTANT1>/gs, '<note type="important">');
  file = file.replace(/<\/IMPORTANT1>/gs, "</note>");
  file = file.replace(/<note([^>]*?)>\s+/gs, "<note$1>");
  file = file.replace(/<note([^>]*?)><p>/gs, "<note$1>\n<p>");
  file = file.replace(/<note([^>]*?)><title>/gs, "<note$1>\n<title>");

  return file;
}

function textCleanUp(file) {
  file = file.replace(/<[A-Za-z]+> <\/[A-Za-z]+>/g, " ");
  file = file.replace(/( )+<\/([A-Za-z0-9]+)>\n/g, "</$2>$1\n");

  file = file.replace(/<\/i>\n( )+<i>/gs, " ");
  file = file.replace(/<\/b>\n( )+<b>/gs, " ");
  file = file.replace(/<\/u>\n( )+<u>/gs, " ");
  file = file.replace(/<\/sup>\n( )+<sup>/gs, " ");
  file = file.replace(/<\/sub>\n( )+<sub>/gs, " ");
  file = file.replace(/<\/i>( )+<i>/gs, " ");
  file = file.replace(/<\/b>( )+<b>/gs, " ");
  file = file.replace(/<\/u>( )+<u>/gs, " ");
  file = file.replace(/<\/sup>( )+<sup>/gs, " ");
  file = file.replace(/<\/sub>( )+<sub>/gs, " ");
  file = file.replace(/<b\/>/gs, "");
  file = file.replace(/<i\/>/gs, "");
  file = file.replace(/<u\/>/gs, "");
  file = file.replace(/<sc\/>/gs, "");
  file = file.replace(/<sub\/>/gs, "");
  file = file.replace(/<sup\/>/gs, "");
  file = file.replace(/<b> <\/b>/gs, "");
  file = file.replace(/<\/i><i>/gs, "");
  file = file.replace(/<b><\/b>/gs, "");
  file = file.replace(/<\/b><b>/gs, "");
  file = file.replace(/<\/u><u>/gs, "");
  file = file.replace(/<\/sc><sc>/gs, "");
  file = file.replace(/<\/sup><sup>/gs, "");
  file = file.replace(/<\/sub><sub>/gs, "");
  file = file.replace(/<\/sup>\n</gs, "</sup>");
  file = file.replace(/( )<\/i>/gs, "</i> ");
  file = file.replace(/( )<\/b>/gs, "</b> ");
  file = file.replace(/( )<\/u>/gs, "</u> ");
  file = file.replace(/( )<\/sup>/gs, "</sup> ");
  file = file.replace(/( )<\/codeph>/gs, "</codeph> ");
  file = file.replace(/( )<\/>/gs, "</sub> ");
  file = file.replace(/<i>( )/gs, " <i>");
  file = file.replace(/<b>( )/gs, " <b>");
  file = file.replace(/<u>( )/gs, " <u>");
  file = file.replace(/<sup>( )/gs, " <sup>");
  file = file.replace(/<sub>( )/gs, " <sub>");
  file = file.replace(/<codeph>( )/gs, " <codeph>");
  file = file.replace(/<p>( )+/gs, "<p>");
  file = file.replace(/<p><\/p>/gs, "");

  file = file.replace(/<i>\.<\/i>/gs, ".");
  file = file.replace(/<i>\-\-<\/i>/gs, "--");
  file = file.replace(/<i>&#x2013;<\/i>/gs, "&#x2013;");

  file = file.replace(/( )+<\/li>/gs, "</li>");
  file = file.replace(/( )+<\/p>/gs, "</p>");

  return file;
}

async function runPrecleanupJs(inputDir, outputDir, iniPath) {
  await copyDir(inputDir, outputDir);

  const entries =
    iniPath && fs.existsSync(iniPath)
      ? loadFindAndReplaceEntries(iniPath)
      : sortEntries(getDefaultEntries());
  const xmlFiles = await listXmlFiles(outputDir);

  for (const filePath of xmlFiles) {
    const folder = path.basename(filePath, path.extname(filePath));
    console.log(folder);

    const fileData = await fs.promises.readFile(filePath, "utf8");
    let text = fileData;

    const cleaned = fmFilesCleanUp(text, folder, entries);
    text = cleaned.file;
    const normalizedFolder = cleaned.folder;

    text = textCleanUp(text);
    text = idGeneration(text, normalizedFolder);
    text = avayaHandling(text);

    await fs.promises.writeFile(filePath, text, "utf8");
  }
}

module.exports = {
  runPrecleanupJs,
};

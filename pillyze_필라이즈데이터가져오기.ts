import cheerio from "cheerio";
import request from "request";
import { doesNotThrow } from "assert";
import fs from "fs";

// const { CrawlingAPI } = require('proxycrawl');
// const Normaltoken = "DpNsKuj6sVP9vFshRnGv6Q";
// const JavaScripttoken = "V0XHWPiatThV4aJVOQBq-w";
// const api = new CrawlingAPI({ token: Normaltoken });

// api
//   .get(
//     `https://www.pillyze.com/products/${2}/%EB%A9%80%ED%8B%B0%EB%B9%84%ED%83%80%EB%AF%BC-%EA%B5%AC%EB%AF%B8`
//   )
//   .then((response:any) => {
//     if (response.statusCode === 200 && response.pcStatus === 200) {
//       console.log(response.body);
//     }
//   })
//   .catch((error:any) => console.error);

const { log } = console;
const getProduct = (pillyze_id: number) => {
  return new Promise((resolve) => {
    request(
      `https://www.pillyze.com/products/${pillyze_id}/%ED%9E%89`,
      {
        headers: {
          "accept-encoding": "deflate, br",
          "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          dnt: 1,
          "sec-ch-ua-platform": "Mac",
          "sec-fetch-dest": "document",
          "user-agent": "PostmanRuntime/7.29.2",
          Accept: "*/*",
          Connection: "keep-alive",
          "User-Agent":"Mozilla/5.1 (Windows NT 10.0; Win64; x64) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/538.36",
        },
      },
      (error, response, body) => {
        if (error) throw error;
        let $ = cheerio.load(body);

        try {
          // id;
          // product_image;
          // product_name;
          // pillyze_id;
          // product_brand;
          // isFood;

          // similar_product_id;
          // main_function;
          // sub_function;
          // eat_method;

          const product_image = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > img"
          ).attr("src");

          const product_name = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > h1"
          ).text();

          const is_food = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > div.marks-wrap > div > div"
          ).text();
          const product_brand = $(
            "body > div > div.all-wrap-in.with-top-bar.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002 > div > div > a > span"
          ).text();
          const eat_method = $("div.section.section3-3 > div > span").text();

          let main_function: string | null = null;
          let sub_function: string | null = null;
          //main_function / sub_function 가져오기
          $("div.section.section3-2 > div > div.card-tags").each((i, item): any => {
            const list = $(item)
              .html()
              ?.split('<div class="card-tag">')
              .map((i) =>
                i
                  .replace("&amp;", "")
                  .replace("</div>", "")
                  .replace(/[\t\n]/g, "")
              )
              .filter((i) => i)
              .join(", ");
            if (i == 0) {
              //주요기능
              main_function = list ? list : null;
            } else if (i == 1) {
              //보조기능
              sub_function = list ? list : null;
            }
          });

          log(product_image);
          log(product_name);
          log(is_food);
          log(product_brand);
          log(eat_method);
          log(main_function);
          log(sub_function);

          if (product_image)
            writeQuery(
              insertForm({
                product_image,
                product_name: product_name.replace(/[']/g, "\\'"),
                similar_product_id: null,
                pillyze_id,
                product_brand: product_brand.replace(/[']/g, "\\'"),
                main_function,
                sub_function,
                eat_method,
                is_food,
              })
            ).then(resolve);
        } catch (error) {
          console.error(error);
        }
      }
    );
  });
};

const writeQuery = async (content: string) => await fs.writeFileSync("./query.txt", content, { flag: "a+" });

const insertForm = ({
  product_image = null,
  product_name,
  similar_product_id = null,
  pillyze_id,
  product_brand,
  main_function = null,
  sub_function = null,
  eat_method,
  is_food,
}: {
  product_image?: string | null;
  product_name: string;
  similar_product_id: string | null;
  pillyze_id: number;
  product_brand: string;
  main_function: string | null;
  sub_function: string | null;
  eat_method: string;
  is_food: string;
}) => `INSERT IGNORE INTO F_DAYWORKS.product_pillyze
(product_image, product_name, similar_product_id, pillyze_id, product_brand, main_function, sub_function, eat_method, is_food)
VALUES('${product_image}', '${product_name}', ${similar_product_id}, ${pillyze_id}, '${product_brand}', '${main_function}', '${sub_function}', '${eat_method}', '${is_food}');
`;
//#endregion

// getProduct(30000);
const exceptList: number[] = [
];

const len = 10000;
const init = 20256;
let id = init;

const wrapSlept = async (sec: number) => await new Promise((resolve) => setTimeout(resolve, sec));
const f = async () => {
  //동작
  while (id < init + len) {
   console.log("id:", id);
    if (!exceptList.includes(id) && id < 28000) {
      getProduct(id);
      await wrapSlept(1000);
    }
    id++;
  }
  console.log("Done!");
};
f();

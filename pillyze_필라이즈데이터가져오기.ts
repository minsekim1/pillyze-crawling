import cheerio from "cheerio";
import request from "request";
import { doesNotThrow } from "assert";
import fs from "fs";

//#region
const getProduct = (pillyze_id: number) => {
  return new Promise((resolve) => {
    request(
      `https://www.pillyze.com/products/${pillyze_id}/%EB%A9%80%ED%8B%B0%EB%B9%84%ED%83%80%EB%AF%BC-%EA%B5%AC%EB%AF%B8`,
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

          // log(product_image);
          // log(product_name);
          // log(isFood);
          // log(product_brand);
          // log(eat_method);
          // log(main_function);
          // log(sub_function);

          if (product_name)
            writeQuery(
              insertForm({
                product_image,
                product_name,
                similar_product_id: null,
                pillyze_id,
                product_brand,
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
  7999, 8000, 8012, 8018, 8022, 8060, 8063, 8064, 8070, 8074, 8077, 8091, 8098, 8104, 8110, 8114, 8136, 8137, 8140,
  8144, 8150, 8151, 8157, 8161, 8169, 8174, 8200, 8204, 8208, 8215, 8219, 8220, 8229, 8235, 8236, 8237, 8261, 8282,
  8284, 8299, 8301, 8310, 8314, 8325, 8331, 8344, 8345, 8375, 8382, 8383, 8389, 8396, 8425, 8434, 8439, 8447, 8453,
  8470, 8488, 8511, 8517, 8521, 8526, 8527, 8529, 8530, 8531, 8540, 8544, 8545, 8554, 8555, 8558, 8568, 8571, 8572,
  8575, 8577, 8580, 8581, 8584, 8594, 8603, 8633, 8636, 8649, 8650, 8838, 8847, 8854, 8856, 8859, 8867, 8868, 8873,
  8874, 8875, 8876, 8879, 8883, 8884, 8887, 8888, 8904, 8933, 8944, 8955, 8956, 8969, 8978, 8981, 8982, 8984, 8991,
];
Array.from({ length: 2000 }).forEach(async (i, index) => {
  const id = index + 1 + 8000;
  if (!exceptList.includes(id)) await getProduct(id);
});

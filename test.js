import { strict as assert } from "assert";
import { rehype } from "rehype";
import rehypeThumbhash from "./index.js";

(async () => {
  try {
    const expectedOutput =
      '<html><head></head><body><img src="example.jpg" data-thumbhash="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAXCAYAAABqBU3hAAAMEElEQVR4AQCBAH7/AMbIyP/DxcT/vb6+/7a2tf+urqz/p6ek/6Sin/+joJ3/pqKe/62oov+1r6n/vrew/8a9tv/Lwbn/y8C5/8i8tP/Cta3/uqyk/7OjnP+tnZb/rJuV/66dl/+0o53/vaqm/8Wzr//Nurf/0b68/9K/vf/Rvbz/zrq5/8q3tv/ItbT/AIEAfv8AycrJ/8bHxv/AwL//uLi3/7Cwrv+qqab/pqSg/6Winv+oo5//rqij/7avqf+/t7D/xr22/8vAuf/MwLj/yby0/8O1rf+7rKT/tKSc/6+fl/+unZb/sZ+Z/7iloP/Aran/ybay/9G9uv/Vwr//18PB/9XBwP/Svr3/z7u6/825uP8AgQB+/wDNzsz/ysrJ/8TEwv+9vLr/tbOx/66sqP+qpqL/qaSf/6uloP+wqqT/uLCp/8C3sP/HvbX/zMC4/8y/t//Ju7P/xLWs/72tpP+2pZ3/sqCZ/7KfmP+2o5z/vamj/8ayrf/Qu7f/2MO//93Ixf/eycf/3cjG/9rFw//XwsD/1cC//wCBAH7/ANPSz//Qzsz/ysjF/8LAvf+6t7T/s6+r/66ppf+tp6H/rqeh/7OrpP+6sKn/wbeu/8i8s//MvrX/zL60/8q6sP/EtKr/vqyj/7imnf+1opn/tqKa/7umn//Drqf/zbiy/9fCvP/gysX/5c/L/+fRzf/m0M3/483K/+DKx//eyMb/AIEAfv8A2NXS/9XSzv/Py8j/yMO//8C6tv+4sq3/s6ym/7Gpov+yqKH/tauj/7uwp//Ctaz/yLqw/8u8sv/Lu7H/ybet/8Sxp/++q6D/uaWb/7eimf+5pJr/v6mg/8ixqv/TvLX/3sfA/+fPyv/t1dD/79fT/+7W0v/r09D/6NDN/+bOy/8AgQB+/wDc1tL/2dPP/9PNyP/MxcD/xLy3/7y0rv+3rqf/tKqi/7SpoP+3qqH/vK6k/8GyqP/Gtqv/ybis/8m3q//Gs6f/wq6i/72onP+5o5j/uKGW/7ujmf/BqaD/y7Oq/9e+tv/iycH/69LL//HY0v/z2tT/8tjU//DW0f/s0s7/6tDM/wCBAH7/AN3W0P/a083/1c3H/87Fvv/GvLX/vrSt/7mupf+1qaD/taie/7epnv+7q6D/wK+j/8Sypv/Gs6b/xrGl/8Ouof+/qZz/uqOX/7efk/+3npL/uqGV/8Gnnf/Msaf/172z/+PIv//s0cn/8dbP//PY0v/y19H/79PO/+zQy//qzsn/AIEAfv8A3NLM/9nPyf/UysP/zcO7/8a7sv+/s6r/uayj/7Wonv+1ppv/tqab/7monP+9q57/wa2g/8KuoP/CrJ7/v6ib/7ujlf+3npD/tJqN/7SZjf+3nZD/v6OY/8mtov/VuK7/4MO6/+jMw//t0cn/79LL/+3Qyf/pzMb/5snD/+TGwf8AgQB+/wDYzcX/1crC/9HFvf/Lv7b/xLeu/72wpv+4qqD/taWb/7SjmP+1o5f/uKWY/7unmv++qZv/v6mb/76nmf+8o5X/t56Q/7OZi/+wloj/sJWH/7SYi/+7npL/xaic/8+yqP/avLL/4sS7/+bIwP/myMH/5Ma//+DCu//cvrf/2bu1/wCBAH7/ANLGvv/Pw7v/y7+2/8a5sP/As6n/u6yi/7annP+zo5j/s6GV/7Silf+3o5b/uqWX/7ynmP+9p5j/vKWW/7mhkv+1m4z/sZaH/66ShP+tkYT/sJSH/7eajf+/opb/yayh/9K1qv/Zu7H/3L61/9y9tf/YurL/1LWu/8+xqv/Mrqf/AIEAfv8Ayr61/8i8s//FuK//wbSq/7yupP+3qZ//tKSa/7Kilv+yoZT/s6GU/7ajlf+6pZf/vKeY/72mmP+8pJX/uaCR/7WbjP+wlof/rJGD/6yQgv+ukYT/s5aK/7uekv/Dppv/y62j/9Czqf/StKv/0bOq/8yup//HqaL/wqSd/7+hmv8AgQB+/wDBtq3/wLSs/72xqf+6rqT/t6qg/7Omm/+xopj/sKGV/7GhlP+0opX/t6SX/7unmf+9qZr/v6ma/76nmP+6o5T/tp2O/7GXif+tk4X/q5GD/62RhP+xlYn/t5uP/76il//EqJ7/yKyi/8mspP/GqaL/waSd/7uel/+2mZL/spWP/wCBAH7/ALitpf+3rKT/taqi/7Oon/+xpZz/r6KZ/66hlv+uoJX/sKGV/7Sjl/+4ppr/vKqc/7+snv/BrJ7/wKuc/72nmP+4oZP/s5uN/6+Wif+sk4b/rJOG/6+Viv+0mo//uqCV/7+km//Cp57/waae/76im/+4nZb/sZaQ/6uQiv+ojYf/AIEAfv8AraWd/6yknf+ro5v/qqGZ/6mgl/+pnpX/qZ6U/6uflf+uoZb/sqSZ/7eonP+8rKD/wK+i/8Kwo//Cr6H/v6ue/7qlmP+1n5L/sJqN/62Wiv+slYn/rpaM/7KakP+2npX/uqGZ/7ujnP+6opv/tp2X/7CXkv+pkIv/o4qG/6CHgv8AgQB+/wChm5X/oJuU/6CalP+gmZP/oJmS/6GZkf+impH/pZyT/6mflf+vo5n/taid/7qtov+/sKX/wbKm/8Gxpf+/raH/uqic/7Silv+vnJD/q5eM/6mVi/+qloz/rZiQ/7GclP+0npf/tZ+Z/7OdmP+umZT/qJOO/6GMiP+bhoL/mIJ//wCBAH7/AJKQi/+SkIv/k5CL/5OQiv+UkIr/lpGL/5iTjP+clo7/oZqS/6eflv+upZv/tKqg/7mupP+8sKX/vK+l/7qsof+1p5z/r6CW/6qakP+llYz/o5KK/6OSiv+llI3/qJeR/6uZlP+smpX/qpiU/6aUkf+fjYv/mYeF/5OBf/+Qfnz/AIEAfv8AgoN//4KDf/+Dg4D/hISA/4WFgP+IhoH/i4mD/4+Mhv+VkYr/m5eP/6Kdlf+popr/rqee/7KpoP+yqaD/sKad/6ugl/+lmpH/n5OL/5qOhv+Yi4T/mIqE/5mMhv+cjor/n5CN/5+Rj/+ekI7/moyL/5SGhv+OgID/iXt7/4Z4eP8AgQB+/wBvdHL/cHRy/3F0cv9ydXP/dHd0/3Z5df96e3f/f397/4SEf/+LioT/kpCK/5mWj/+fm5T/op2W/6Odlv+gmpP/nJSN/5aOh/+Ph4D/ioF8/4d+ef+HfXn/iX97/4uBf/+OhIL/j4WE/4+EhP+LgYL/h3x9/4F3eP98cnT/em9x/wCBAH7/AFxjY/9cZGT/XWRk/19lZf9hZ2b/Y2ln/2dsaf9rb2z/cXRx/3h6dv9/gHz/hoaB/4uLhf+PjYj/j42H/42KhP+IhH//gn14/3t2cv92cWz/c21q/3Nsav90bmz/d3Fw/3p0dP98dnb/fHZ3/3pzdv92b3L/cWtu/21nav9rZGj/AIEAfv8ASVNV/0lUVf9KVFX/TFVW/01XV/9QWFj/U1ta/1hfXf9dY2H/ZGlm/2tvbP9xdHH/d3l1/3p7d/96e3b/eHdz/3Nybv9sa2f/ZmRg/2BeW/9dWlj/XVpY/15bW/9iXl//ZmJj/2hlZ/9pZmn/aGRo/2VhZf9hXWL/XVpf/1tYXf8AgQB+/wA4RUj/OUVI/zpGSP87R0j/PEhJ/z9JSv9CTEz/Rk9P/0tTUv9RWVf/WF5c/15kYf9jaGX/Zmpn/2ZpZv9jZmP/XmBd/1hZVv9RUk//TExK/0hIR/9IR0f/SklK/05NT/9SUVT/VlVY/1dWWv9XVlv/VFNZ/1FQVv9OTVP/TEtS/wCBAH7/ACw6Pv8sOz7/LTs+/y48Pv8wPT//Mj5A/zRAQf84Q0T/PUdH/0NMS/9JUVD/T1dV/1RaWP9XXFr/V1xZ/1RYVv9PUlD/SEtJ/0FDQv88PT3/ODo6/zg5Ov86Oz3/Pj9C/0NER/9HSEz/SUpP/0lKUP9ISU//RUZN/0JDSv9BQkn/AYEAfv8AJTU4/yY1OP8mNTn/JzY5/yk3Of8qODr/LTo7/zE9Pf81QEH/O0VF/0FKSv9HT07/TFNS/05VU/9OVFL/S1BO/0ZKSf8/Q0L/ODs7/zM2Nf8wMjP/LzIz/zI0Nv82ODv/Oz1B/z9BRv9CQ0n/QkRK/0FDSf8+QEf/PD5F/zo8RP9vAgfU72TBvwAAAABJRU5ErkJggg=="></body></html>';
    console.time("converted-in");
    const file = await rehype()
      .use(rehypeThumbhash, { dir: "./", format: "url" })
      .process('<img src="example.jpg">');

    const output = String(file).trim();
    console.timeEnd("converted-in");
    //console.log(output);
    assert.strictEqual(output, expectedOutput);
    const shortOutput = output.substring(0, 100) + "...";
    console.log("Test passed:", shortOutput);
    console._times.clear();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1); // Exit with status code 1 when the test fails
  }
})();

(async () => {
  try {
    const expectedOutput = '<html><head></head><body><img src="example.jpg" data-thumbhash="ZhgODYKHh3l/ioh0d5hohkVtEOYG"></body></html>'
    console.time("converted-in");
    const file = await rehype()
      .use(rehypeThumbhash, { dir: "./" })
      .process('<img src="example.jpg">');

    const output = String(file).trim();
    console.timeEnd("converted-in");
    //console.log(output);
    assert.strictEqual(output, expectedOutput);
    const shortOutput = output.substring(0, 100) + "...";
    console.log("Test passed:", shortOutput);
    console._times.clear();
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1); // Exit with status code 1 when the test fails
  }
})();

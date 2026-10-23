import type { CSSProperties } from "react";
import { PLACEHOLDER } from "@/lib/placeholders";

// Card previews — decorative mini versions of each concept (content stays in
// English on purpose: these are fictional client brands).

const scroll = (px: number) => ({ "--scroll": `${px}px` }) as CSSProperties;

export function CoffeePreview() {
  return (
    <div className="preview-track pv pv-coffee" style={scroll(-348)}>
      <div className="c-nav">
        <span className="c-brand">
          [Ember&nbsp;&amp;&nbsp;Oak] <span className="logo-ph">{PLACEHOLDER.logo}</span>
        </span>
        <span className="c-links">
          <span>Shop</span>
          <span>Story</span>
          <span>Journal</span>
        </span>
        <span className="c-cart">Cart · 2</span>
      </div>
      <div className="c-hero">
        <h3>
          Small-batch coffee,
          <br />
          <em>roasted to order.</em>
        </h3>
        <p>Sourced from farms we’ve actually met. Roasted the day it ships.</p>
      </div>
      <div className="c-heroimg ph">[roastery photo]</div>
      <div className="c-row">
        {[
          ["Sunday", "$19"],
          ["Dusk", "$21"],
          ["No. 6", "$22"],
        ].map(([nm, pr]) => (
          <div className="c-prod" key={nm}>
            <div className="ph">[bag]</div>
            <div className="nm">{nm}</div>
            <div className="pr">{pr}</div>
          </div>
        ))}
      </div>
      <div className="c-quote">
        <div className="q">“The best mail-order bag we’ve opened all year.”</div>
        <div className="a">— [Publication]</div>
      </div>
    </div>
  );
}

const BARS = [38, 54, 46, 68, 60, 82, 74, 94, 88];

export function FintechPreview() {
  return (
    <div className="preview-track pv pv-fintech" style={scroll(-352)}>
      <div className="f-top">
        <span className="f-brand">
          <span className="d" />
          [Northwind] <span className="logo-ph">{PLACEHOLDER.logo}</span>
        </span>
        <span className="f-nav">
          <span className="on">Overview</span>
          <span>Flows</span>
          <span>Cards</span>
        </span>
      </div>
      <div className="f-head">
        <div className="lbl">Total balance</div>
        <div className="big">
          $248,910 <small>▲ 12.4%</small>
        </div>
      </div>
      <div className="f-kpis">
        <div className="f-kpi">
          <div className="k">Inflow</div>
          <div className="v up">+$62k</div>
        </div>
        <div className="f-kpi">
          <div className="k">Burn</div>
          <div className="v">$18k</div>
        </div>
        <div className="f-kpi">
          <div className="k">Runway</div>
          <div className="v">19mo</div>
        </div>
      </div>
      <div className="f-chart">
        <div className="ct">Net revenue · last 9 months</div>
        <div className="f-bars">
          {BARS.map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="f-table">
        {[
          ["Stripe payout", "+$12,400", "pos"],
          ["AWS", "−$2,180", "neg"],
          ["Payroll", "−$9,600", "neg"],
          ["Invoice #2231", "+$5,000", "pos"],
        ].map(([nm, am, cls]) => (
          <div className="f-tr" key={nm}>
            <span className="nm">{nm}</span>
            <span className={`am ${cls}`}>{am}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WellnessPreview() {
  return (
    <div className="preview-track pv pv-wellness" style={scroll(-300)}>
      <div className="w-status">
        <span>9:41</span>
        <span>▦ ▦ ◍</span>
      </div>
      <div className="w-head">
        <div className="hi">
          [Stillwater] · <span className="logo-ph">{PLACEHOLDER.logo}</span>
        </div>
        <h3>
          Good evening,<span>let’s unwind.</span>
        </h3>
      </div>
      <div className="w-breathe">
        <div className="w-circle">
          <b>Breathe</b>
        </div>
      </div>
      <div className="w-list">
        {[
          ["", "Deep Sleep", "22 min · tonight"],
          ["b", "Focus Flow", "15 min · ambient"],
          ["c", "Calm Mind", "10 min · guided"],
        ].map(([ic, t, s]) => (
          <div className="w-card" key={t}>
            <span className={`ic ${ic}`} />
            <div>
              <div className="t">{t}</div>
              <div className="s">{s}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-tabs">
        <i className="on" />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function FoodPreview() {
  return (
    <div className="preview-track pv pv-food" style={scroll(-318)}>
      <div className="o-top">
        <span className="o-loc">
          Deliver to<b>Dorćol, BG</b>
        </span>
        <span className="o-brand">
          [Tako] <span className="logo-ph">{PLACEHOLDER.logo}</span>
        </span>
      </div>
      <div className="o-search">Search tacos, bowls, drinks…</div>
      <div className="o-chips">
        <span className="on">Popular</span>
        <span>Tacos</span>
        <span>Bowls</span>
        <span>Drinks</span>
      </div>
      <div className="o-promo">
        <div className="tag">Tonight only</div>
        <h3>
          2-for-1
          <br />
          street tacos
        </h3>
        <div className="sub">Order by 9pm · free delivery</div>
        <div className="badge" />
      </div>
      <div className="o-list">
        {[
          ["Al Pastor", "pineapple · cilantro", "$4.50"],
          ["Baja Fish", "slaw · lime crema", "$5.00"],
          ["Birria Bowl", "consommé · onion", "$7.50"],
        ].map(([nm, ds, pr]) => (
          <div className="o-item" key={nm}>
            <div className="ph">[dish]</div>
            <div>
              <div className="nm">{nm}</div>
              <div className="ds">{ds}</div>
              <div className="pr">{pr}</div>
            </div>
            <span className="add">+</span>
          </div>
        ))}
      </div>
      <div className="o-tabs">
        <i className="on" />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

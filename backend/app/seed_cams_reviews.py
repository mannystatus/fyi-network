"""
Run with: python -m app.seed_cams_reviews

Publishes fyiCams' hand-written "Staff Reviews" articles — the narrative
counterpart to the structured score/pros/cons data in
frontend/lib/camsReviews.ts (CAMS_REVIEWS), which is keyed by the same slug
so the article page's sidebar and /reviews/[slug] both pick it up
automatically (see CamsArticleSidebar.tsx). Idempotent like ingest_news.py:
already-seen slugs are skipped, so re-running after editing REVIEWS below
only adds what's new rather than duplicating rows.
"""
from .database import Base, SessionLocal, engine, ensure_schema
from .models import Article, Brand

REVIEWS = [
    dict(
        slug="sony-a7r-vi-review",
        title="Sony A7R VI review: 66.8MP and 30fps, no longer a tradeoff",
        dek="Sony's flagship resolution camera adds flagship speed — at a flagship price.",
        body_md="""Sony's R-series has always been the megapixel camera, the one you bought for resolution and forgave for everything else. The A7R VI breaks that trade-off. It pairs a new 66.8MP stacked full-frame sensor with a BIONZ XR2 processor built for AI-assisted subject recognition, and the result shoots at up to 30fps with full autofocus tracking — burst speed that used to be the domain of Sony's sports-focused A9 line, not its resolution flagship.

In-body stabilization is rated to 8.5 stops, and video tops out at 8K, backed by a new higher-capacity "SA"-type battery that Sony says delivers 27% more capacity than the packs in previous high-end Alpha bodies. In practice, the extra headroom shows: the A7R VI feels less like a specialist studio camera and more like something you could shoot a wedding, a wildlife trip, and a landscape series with, all on the same body.

It isn't without rough edges. The shutter blades are famously thin and easy to crease if you touch them during a sensor clean — an expensive mistake waiting to happen. The rear screen doesn't support HDR even though the camera can shoot it, several useful defaults (focus breathing compensation, shutter curtain protection) ship turned off, and video shooters will still miss open-gate recording. Rolling shutter also creeps back in during fast pans, a reminder this is a resolution camera wearing a speed camera's clothes, not a true A9 replacement.

At around $4,500, it's the most expensive A7R yet, and if resolution alone is what you're after, the jump over the A7R V is hard to justify. But paired with the speed and AI tracking now on board, this is the first R-series body that doesn't ask you to choose between sharp and fast.""",
    ),
    dict(
        slug="leica-sl3-p-review",
        title="Leica SL3-P review: the fastest Leica ever made",
        dek="44 megapixels, 40fps, and autofocus that finally keeps up — for $6,690 and up.",
        body_md="""For a company whose most famous camera doesn't autofocus at all, the SL3-P is a statement. Leica's new full-frame flagship pairs a freshly developed 44MP BSI sensor with the brand's fastest-ever autofocus system: 819 phase-detection points, machine-learning subject recognition, and a continuous shooting mode that hits 40fps with full AF tracking — about 156% faster than the outgoing SL3.

Dynamic range is rated at 14 stops across a native ISO 50–200,000 range, and video shooters get a genuinely serious spec sheet: 8K open-gate, ProRes support, and 4K up to 120p, with rolling shutter reduced enough to make handheld pans usable. This is the first SL that feels built for hybrid shooters rather than photographers who happen to tolerate video as an afterthought.

The catches are mostly ones longtime Leica shooters will recognize. It's heavy for its class, even before you mount a serious L-mount zoom. The rear screen tilts but doesn't swivel. Autofocus is dramatically better than any SL before it, but it still won't outrun a Sony A7R VI or a Panasonic S1R II on raw tracking speed, and the camera won't auto-detect subject type — you choose between people, animals, or vehicles yourself before you start shooting. Controls are minimal, with only four labeled buttons pushing most adjustments onto the touchscreen.

At $6,690 body-only — and up to $10,995 for the launch kit with two zooms — the SL3-P is still unmistakably a Leica price. What's different is that, for the first time on an SL body, the autofocus system justifies asking a working photographer to actually consider it as a primary camera, not just a beautifully built second body.""",
    ),
    dict(
        slug="leica-m-ev1-review",
        title="Leica M EV1 review: an M without the rangefinder",
        dek="The first M with a built-in electronic viewfinder is 60 megapixels of very deliberate heresy.",
        body_md="""Every Leica M since 1954 has centered on the rangefinder patch — the little split-image window that's the whole reason people either love or never understand the system. The M EV1 removes it. In its place is a 5.76-million-dot OLED electronic viewfinder, 0.76x magnification, 100% frame coverage, with focus peaking, magnification, and digital zoom frame lines layered on top. It's the first M in the line's history that lets you see exactly what the sensor sees before you press the shutter.

That sensor is new too: a 60.3MP BSI chip that can output at full 60MP, or downsample in-camera to 36MP or 18MP, each using the entire sensor area rather than cropping. Dynamic range is rated at 15 stops. Battery life, unusually for an EVF-equipped mirrorless camera, actually holds up reasonably well — Leica quotes 237 shots through the viewfinder, which sounds modest until you compare it to most other EVF cameras in this class.

What the M EV1 still refuses to do is autofocus. Every M lens ever made mounts and meters correctly, but focusing remains entirely manual, now aided by focus peaking rather than a mechanical rangefinder patch — no IBIS, no video, and no image stabilization of any kind. Battery life, while good for an EVF body, is still short of a standard M with an optical finder, and the fixed rear screen doesn't tilt. In low light, the EVF's frame rate visibly drops and can show a "jello" rolling effect that's distracting when panning.

At $8,995 body-only, it's priced like every M, and it will divide the M faithful the way every real change to this line always has. What it isn't is a compromise EVF bolted onto an old design — it's a genuinely new way to use M lenses, built for photographers who want the M system's optics without needing to learn rangefinder focusing to use them.""",
    ),
    dict(
        slug="nikon-zr-review",
        title="Nikon ZR review: a $2,200 camera that shoots RED RAW",
        dek="Nikon's smallest full-frame body is also its most surprising — 6K RAW video for cinema-camera money nobody expected.",
        body_md="""Nikon spent decades being the company photographers picked for stills and video shooters mostly worked around. The ZR flips that. It's a 25MP partially-stacked full-frame body built around video first, and its headline trick is real: internal 6K RAW recording in three formats — Nikon's own N-RAW, Apple ProRes RAW, and RED's own R3D NE — at a price, $2,200, that undercuts dedicated cinema cameras by thousands of dollars.

The Expeed 7 processor drives 8 stops of 5-axis in-body stabilization plus electronic VR for handheld video, 32-bit float audio recording that makes clipped audio nearly a non-issue, and a 4-inch, 1000-nit rear screen bright enough to judge exposure outdoors. At 6K/60p, footage grades against high-end RED cinema camera output more easily than anything else in this price range, and autofocus — historically Nikon's weak spot against Sony and Canon — actually keeps up with moving subjects here.

It's not a cinema camera in a full-frame trench coat, though, and the compromises show where you'd expect. There's no built-in electronic viewfinder, so anything shot in bright daylight leans entirely on the rear screen. Battery life falls short of a full day's shooting without spares. And H.265 clips need close to a second of lead-in before bitrate settles, which is a real problem if you're chasing a fast-moving shot rather than rolling ahead of it.

Next to a Sony FX3 or Canon EOS C70 — the compact cinema bodies it's clearly aimed at — the ZR undercuts both on price while matching or beating them on RAW video quality. For anyone who wants RED-grade footage without a RED-sized budget, this is the camera Nikon wasn't expected to make.""",
    ),
    dict(
        slug="dji-osmo-action-6-review",
        title="DJI Osmo Action 6 review: the action cam that finally beats the dark",
        dek="A variable aperture — a first for the category — makes DJI's newest action camera the one to beat after dark.",
        body_md="""Action cameras have always made the same trade for their fixed, tiny apertures: great in daylight, noisy and soft the moment the sun goes down. The Osmo Action 6 is the first in the category to ship with a variable f/2.0–f/4.0 aperture, paired with a 1/1.1-inch sensor — physically larger than what GoPro or Insta360 put in their equivalents — rated for 13.5 stops of dynamic range.

The payoff shows up specifically in DJI's SuperNight mode, which turns in clean 4K/60p footage in conditions that would normally push an action cam into a grainy mess. Daytime shooters aren't left out either: the Action 6 records 4K at 120fps in a 4:3 aspect ratio and adds an 8K capture mode, backed by a 1,950mAh battery good for roughly four hours and an 18-minute fast charge to 80% over USB-C.

Independent testing puts it ahead of both GoPro's Mission 1 Pro and Insta360's Ace Pro 2 on overall low-light and dynamic-range performance this generation, though not on every axis — GoPro's HyperSmooth 7.0 still handles extreme high-frequency vibration slightly better, and the Leica-tuned Ace Pro 2 remains a close competitor on absolute low-light noise. The bigger practical catch for U.S. buyers is availability: DJI still has no first-party U.S. retail presence for its camera line, which means sourcing one takes more effort than picking up a GoPro at a local store.

At $369 to $439 depending on the bundle, the Action 6 undercuts both rivals on price while leading them in the one place action cameras have always struggled: after the sun goes down. If DJI can sort out U.S. distribution, this is the new one to beat.""",
    ),
]


def seed_cams_reviews(db) -> int:
    brand = db.query(Brand).filter(Brand.slug == "fyicams").first()
    if not brand:
        raise SystemExit("fyicams brand not found — run `python -m app.seed` first.")

    existing_slugs = {row[0] for row in db.query(Article.slug).filter(Article.brand_id == brand.id).all()}
    added = 0
    for review in REVIEWS:
        if review["slug"] in existing_slugs:
            print(f"  skip (already exists): {review['slug']}")
            continue
        db.add(
            Article(
                brand_id=brand.id,
                slug=review["slug"],
                category="Staff Reviews",
                title=review["title"],
                dek=review["dek"],
                body_md=review["body_md"],
                author="fyiCams Staff",
                is_published=True,
                is_featured=True,
            )
        )
        print(f"  +added: {review['slug']}")
        added += 1
    db.commit()
    return added


def main():
    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)
    db = SessionLocal()
    try:
        added = seed_cams_reviews(db)
        print(f"Done — {added} new Staff Review article(s) added.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

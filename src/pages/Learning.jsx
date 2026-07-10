import React, { useEffect } from 'react';
import Icon from '../icons.jsx';
import { useStore, A, openModal, startImport, chapterById, subById } from '../store.jsx';
import { PageHead, Empty, QuestionRow, RichText, ConceptPane, IconBtn } from '../ui.jsx';
import { EXC, embedUrl } from '../helpers.js';
import { ConfirmDelete } from '../ui.jsx';
import { ChapterModal, SubtopicModal, VideoModal, PdfModal, QuestionModal, PreviewQuestion } from '../modals.jsx';
import { downloadTemplate } from '../excel.js';

export default function Learning() {
  const S = useStore();
  useEffect(() => { A.loadLearning(); }, [S.exam]);
  const ch = S.cid ? chapterById(S.cid) : null;
  if (!ch) return <ChapterList />;
  const sub = S.sid ? subById(ch, S.sid) : null;
  if (!sub) return <ChapterView chapter={ch} />;
  return <SubtopicView chapter={ch} sub={sub} />;
}

function ChapterList() {
  const S = useStore();
  const list = S.lms[S.exam];
  return (
    <>
      <PageHead eyebrow={`${S.exam} · catalog`} eyebrowColor={EXC[S.exam]} title="Chapters & content"
        desc="Build the learning library: chapters, subtopics, concepts, videos, materials and quizzes."
        actions={<button className="btn primary" onClick={() => openModal(<ChapterModal />)}><Icon name="plus" /> Add chapter</button>} />
      {list.length ? (
        <div className="card">
          {list.map((c, i) => (
            <div className="lcard" key={c.id} onClick={() => A.openChapter(c.id)}>
              <span className="draghint" title="Drag to reorder"><Icon name="grip" /></span>
              <div className="nidx">{i + 1}</div>
              <div><div className="lc-t">{c.name}</div><div className="lc-s">{c.subs.length} subtopic{c.subs.length !== 1 ? 's' : ''} · {c.subs.reduce((a, s) => a + s.quiz.length, 0)} questions</div></div>
              <div className="lc-meta">
                <span className="mchip"><Icon name="book" /> {c.subs.length}</span>
                <button className="ibtn" title="Rename" onClick={(e) => { e.stopPropagation(); openModal(<ChapterModal chapter={c} />); }}><Icon name="edit" /></button>
                <button className="ibtn del" title="Delete" onClick={(e) => { e.stopPropagation(); openModal(<ConfirmDelete what={c.name} onYes={() => A.delChapter(c.id)} />); }}><Icon name="trash" /></button>
                <Icon name="chevR" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><Empty icon="folder" title={`No chapters for ${S.exam}`} text="Add your first chapter, such as “Arithmetic”." action={<button className="btn primary" onClick={() => openModal(<ChapterModal />)}><Icon name="plus" /> Add chapter</button>} /></div>
      )}
    </>
  );
}

function ChapterView({ chapter: ch }) {
  const S = useStore();
  const realSubs = ch.subs.filter((s) => !s._practiceBank);
  return (
    <>
      <div className="lpath"><a onClick={() => A.nav('learning')}>{S.exam} · Chapters</a><Icon name="chevR" /><span className="cur">{ch.name}</span></div>
      <PageHead eyebrow="Chapter" title={ch.name} desc="Each subtopic has its learning content (concept, video, quiz) and its own Practice questions — the practice set drives the adaptive practice section, one subtopic at a time." actions={<button className="btn primary" onClick={() => openModal(<SubtopicModal chapterName={ch.name} />)}><Icon name="plus" /> Add subtopic</button>} />
      {realSubs.length ? (
        <div className="card">
          {realSubs.map((s, i) => (
            <div className="lcard" key={s.id} onClick={() => A.openSubtopic(s.id)}>
              <span className="draghint" title="Drag to reorder"><Icon name="grip" /></span>
              <div className="nidx">{i + 1}</div>
              <div><div className="lc-t">{s.name}</div><div className="lc-s">{s.concept ? 'Concept added' : 'No concept'} · {s.videos.length} video{s.videos.length !== 1 ? 's' : ''} · {s.pdfs.length} file{s.pdfs.length !== 1 ? 's' : ''} · {s.quiz.length} questions</div></div>
              <div className="lc-meta">
                <span className="mchip"><Icon name="video" /> {s.videos.length}</span><span className="mchip"><Icon name="doc" /> {s.pdfs.length}</span><span className="mchip"><Icon name="list" /> {s.quiz.length}</span>
                <button className="btn ghost sm" title="Upload this subtopic's practice questions" onClick={(e) => { e.stopPropagation(); A.openPracticeBank(s.id); }}><Icon name="list" /> Practice</button>
                <button className="ibtn" title="Rename" onClick={(e) => { e.stopPropagation(); openModal(<SubtopicModal subtopic={s} chapterName={ch.name} />); }}><Icon name="edit" /></button>
                <button className="ibtn del" title="Delete" onClick={(e) => { e.stopPropagation(); openModal(<ConfirmDelete what={s.name} onYes={() => A.delSubtopic(s.id)} />); }}><Icon name="trash" /></button>
                <Icon name="chevR" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><Empty icon="book" title="No subtopics yet" text="Add a subtopic such as “Averages” to start building its learning content." action={<button className="btn primary" onClick={() => openModal(<SubtopicModal chapterName={ch.name} />)}><Icon name="plus" /> Add subtopic</button>} /></div>
      )}
    </>
  );
}

function SubtopicView({ chapter: ch, sub: s }) {
  const S = useStore();
  const tab = s._practiceBank ? 'quiz' : S.tab;
  const TabBtn = ({ t, label, icn, n }) => (
    <button className={tab === t ? 'on' : ''} onClick={() => A.setTab(t)}><Icon name={icn} /> {label}{n != null && <span className="cellsub" style={{ fontFamily: 'var(--m)' }}> ({n})</span>}</button>
  );
  return (
    <>
      <div className="lpath"><a onClick={() => A.nav('learning')}>{S.exam} · Chapters</a><Icon name="chevR" /><a onClick={() => A.openChapter(ch.id)}>{ch.name}</a><Icon name="chevR" /><span className="cur">{s._practiceBank ? 'Practice questions' : s.name}</span></div>
      <PageHead eyebrow={s._practiceBank ? `Chapter · ${ch.name}` : 'Subtopic'} title={s._practiceBank ? 'Practice questions' : s.name}
        desc={s._practiceBank ? 'These appear in the student practice section for this chapter (adaptive via the MAB) and count toward its mastery.' : undefined} />
      {!s._practiceBank && (
        <div className="tabs">
          <TabBtn t="concepts" label="Concept" icn="book" />
          <TabBtn t="videos" label="Videos" icn="video" n={s.videos.length} />
          <TabBtn t="materials" label="Materials" icn="doc" n={s.pdfs.length} />
          <TabBtn t="quiz" label="Quiz" icn="list" n={s.quiz.length} />
        </div>
      )}
      <div>{
        tab === 'concepts' ? <ConceptPane html={s.concept} onSave={(html) => A.saveConcept(html)} onUpload={(file) => A.uploadConceptHtml(file)} />
        : tab === 'videos' ? (
          <div className="media-grid">
            <div className="adder" onClick={() => openModal(<VideoModal />)}><Icon name="video" /><div><b>Add video</b><div className="cellsub">YouTube/Vimeo link or upload</div></div></div>
            {s.videos.map((v) => (
              <div className="media" key={v.id}><div className="thumb" style={{ color: 'var(--varc)' }}>
                {embedUrl(v.src)
                  ? <iframe src={embedUrl(v.src)} title={v.title} loading="lazy" referrerPolicy="origin" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }} />
                  : (v.src && /\.(mp4|webm)(\?|$)/i.test(v.src))
                    ? <video src={v.src} controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <Icon name="video" />}
              </div>
                <div className="mbody"><div className="mt">{v.title}</div><div className="ms">{v.dur ? v.dur + ' · ' : ''}{v.src || 'uploaded'}</div>
                  <div className="mact"><button className="btn ghost sm" onClick={() => openModal(<VideoModal video={v} />)}><Icon name="edit" /> Edit</button><button className="btn danger sm" onClick={() => A.delVideo(v.id)}><Icon name="trash" /></button></div></div></div>
            ))}
          </div>
        )
        : tab === 'materials' ? (
          <div className="media-grid">
            <div className="adder" onClick={() => openModal(<PdfModal />)}><Icon name="upload" /><div><b>Upload material</b><div className="cellsub">PDF, slides or notes</div></div></div>
            {s.pdfs.map((p) => (
              <div className="media" key={p.id}><div className="thumb" style={{ color: 'var(--gmat)' }}><Icon name="doc" /></div>
                <div className="mbody"><div className="mt">{p.title}</div><div className="ms">{p.size || ''}</div>
                  <div className="mact"><button className="btn ghost sm" onClick={() => A.openPdf(p.id)}><Icon name="eye" /> Open</button><button className="btn ghost sm" onClick={() => A.delPdf(p.id)}><Icon name="trash" /> Remove</button></div></div></div>
            ))}
          </div>
        )
        : (
          <>
            <div className="toolbar">
              <button className="btn primary sm" onClick={() => startImport({ kind: 'quiz' })}><Icon name="upload" /> Bulk upload (.xlsx)</button>
              <button className="btn ghost sm" onClick={() => openModal(<QuestionModal target={{ kind: 'quiz' }} />)}><Icon name="plus" /> Add question</button>
              <button className="btn ghost sm" onClick={downloadTemplate}><Icon name="download" /> Template</button>
              <div className="grow" /><span className="cellsub">{s.quiz.length} question{s.quiz.length !== 1 ? 's' : ''}</span>
            </div>
            {s.quiz.length ? s.quiz.map((q, i) => (
              <QuestionRow key={q.id} q={q} i={i} total={s.quiz.length}
                onMove={(dir) => A.moveQuestion(q.id, dir)} onPreview={() => openModal(<PreviewQuestion q={q} />)}
                onEdit={() => openModal(<QuestionModal question={q} />)} onDelete={() => A.delQuestion(q.id)} />
            )) : <div className="card"><Empty icon="list" title="No questions yet" text="Add questions one by one, or upload them in bulk from an Excel file — images in questions and options are supported." action={<button className="btn primary" onClick={() => startImport({ kind: 'quiz' })}><Icon name="upload" /> Bulk upload</button>} /></div>}
          </>
        )
      }</div>
    </>
  );
}

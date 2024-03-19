import { useLoaderData } from "react-router";
import { Link } from "react-router-dom";
import {
  DocumentReference,
  DocumentReferenceWithKeywords,
} from "../../types/documents";
import Search from "../Search/Search";
import { ReactNode, useRef, useState } from "react";
import { Keyword } from "../../types/keywords";
import { includeKeywordsInDocuments } from "../../utils/keywords";
import { useRegisterAction } from "../../services/actions";
import { writeText } from "@tauri-apps/api/clipboard";

interface DocumentsOverviewProps {
  // Documents overview could be uses as a document selector, wrapped in a dialog component. Callbacks resolve promise like prompt handles this
  onDocumentClick: (document: DocumentReference) => void;
  onDocumentSelection?: (document: DocumentReference | null) => void;
  documentReferences: DocumentReference[];
  keywords: Keyword[];
  children?: ReactNode | ReactNode[];
}

function DocumentsOverview({
  onDocumentClick,
  onDocumentSelection = () => {},
  documentReferences,
  keywords,
  children,
}: DocumentsOverviewProps) {
  const documentsRef = useRef<HTMLUListElement>(null);

  const [selectedDocument, setSelectedDocument] =
    useState<DocumentReference | null>(null);

  const selectDocument = (document: DocumentReference | null) => {
    setSelectedDocument(document);
    onDocumentSelection(document);
  };

  useRegisterAction("Copy selected document id", "cmd+c", async () => {
    if (selectedDocument === null) {
      return;
    }

    await writeText(selectedDocument.id);
  });

  const [filteredDocuments, setFilteredDocuments] = useState<
    DocumentReferenceWithKeywords[]
  >(includeKeywordsInDocuments(documentReferences, keywords));

  return (
    <div data-component-name="DocumentsOverview" aria-live="polite">
      <Search
        list={includeKeywordsInDocuments(documentReferences, keywords)}
        keys={["name", "keywords.label"]}
        onConfirm={() => {
          documentsRef.current?.querySelector("a")?.focus();
        }}
        onResult={(searchResults) => {
          // Currently all documents go tru search, this might not be the best idea
          setFilteredDocuments(searchResults);
        }}
      />
      <section
        id="documents"
        aria-label="Documents"
        className="ring-1 ring-black"
      >
        {filteredDocuments.length > 0 ? (
          <ul ref={documentsRef} role="menu">
            {filteredDocuments.map((document) => (
              <li
                role="menuitem"
                aria-relevant="additions removals"
                key={document.id}
                className="underline"
              >
                <button
                  onFocus={() => selectDocument(document)}
                  onBlur={() => selectDocument(null)}
                  onClick={() => onDocumentClick(document)}
                  // to={`/documents/${document.id}`}
                >
                  {document.name}
                  {document.keywords.length > 0 && (
                    <span>
                      , Keywords:{" "}
                      {document.keywords
                        .map((keywords) => keywords.label)
                        .join(", ")}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p aria-relevant="additions text" role="alert">
            No documents found
          </p>
        )}
      </section>
      {children}
    </div>
  );
}
export default DocumentsOverview;

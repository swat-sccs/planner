-- Supports the term filter used by the course search.
CREATE INDEX "Course_year_isShown_idx" ON "Course"("year", "isShown");

-- Supports selecting distribution attributes (for example NS, SS, and W).
CREATE INDEX "sectionAttribute_code_idx" ON "sectionAttribute"("code");

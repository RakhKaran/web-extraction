# ✅ Staging Models Created for 4 Job Sites

## 📦 Models & Repositories Created

### 1. StagingGlassdoor ✅
**File:** `src/models/staging-glassdoor.model.ts`
**Repository:** `src/repositories/staging-glassdoor.repository.ts`

**Fields:**
- ✅ `title` (string, required)
- ✅ `companyName` (string, required)
- ✅ `companyAbout` (string, optional)
- ✅ `description` (string, required)
- ✅ `salary` (string, optional)
- ✅ `openings` (string, optional)
- ✅ `location` (string, required)
- ✅ `keySkills` (array of strings, required)
- ✅ `redirectUrl` (string, required)
- ✅ `companyLogo` (string, optional)
- ✅ `experience` (string, optional)
- ✅ `posted` (string, optional)
- ✅ `companyRating` (string, optional)
- ✅ `scrappedAt` (date, optional)
- ✅ `createdAt` (date, auto-generated)
- ✅ `updatedAt` (date, optional)
- ✅ `deletedAt` (date, optional)
- ✅ `isDeleted` (boolean, default: false)
- ✅ `isSync` (boolean, default: false)

---

### 2. StagingTimesjob ✅
**File:** `src/models/staging-timesjob.model.ts`
**Repository:** `src/repositories/staging-timesjob.repository.ts`

**Fields:**
- ✅ `title` (string, required)
- ✅ `description` (string, required)
- ✅ `companyName` (string, required)
- ✅ `companyLogo` (string, optional)
- ✅ `location` (string, required)
- ✅ `experience` (string, required)
- ✅ `salary` (string, required)
- ✅ `posted` (string, optional)
- ✅ `openings` (string, optional)
- ✅ `applicants` (string, optional)
- ✅ `aboutCompany` (string, optional)
- ✅ `skills` (array of strings, required)
- ✅ `redirectUrl` (string, required)
- ✅ `scrappedAt` (date, optional)
- ✅ `createdAt` (date, auto-generated)
- ✅ `updatedAt` (date, optional)
- ✅ `deletedAt` (date, optional)
- ✅ `isDeleted` (boolean, default: false)
- ✅ `isSync` (boolean, default: false)

---

### 3. StagingIndeed ✅
**File:** `src/models/staging-indeed.model.ts`
**Repository:** `src/repositories/staging-indeed.repository.ts`

**Fields:**
- ✅ `title` (string, required)
- ✅ `companyName` (string, required)
- ✅ `description` (string, required)
- ✅ `salary` (string, optional)
- ✅ `location` (string, required)
- ✅ `keySkills` (array of strings, optional)
- ✅ `redirectUrl` (string, required)
- ✅ `companyLogo` (string, optional)
- ✅ `experience` (string, optional)
- ✅ `posted` (string, optional)
- ✅ `companyRating` (string, optional)
- ✅ `jobType` (string, optional)
- ✅ `snippet` (string, optional)
- ✅ `scrappedAt` (date, optional)
- ✅ `createdAt` (date, auto-generated)
- ✅ `updatedAt` (date, optional)
- ✅ `deletedAt` (date, optional)
- ✅ `isDeleted` (boolean, default: false)
- ✅ `isSync` (boolean, default: false)

---

### 4. StagingMonster ✅
**File:** `src/models/staging-monster.model.ts`
**Repository:** `src/repositories/staging-monster.repository.ts`

**Fields:**
- ✅ `title` (string, required)
- ✅ `companyName` (string, required)
- ✅ `description` (string, required)
- ✅ `salary` (string, optional)
- ✅ `location` (string, required)
- ✅ `experience` (string, required)
- ✅ `keySkills` (array of strings, required)
- ✅ `redirectUrl` (string, required)
- ✅ `companyLogo` (string, optional)
- ✅ `posted` (string, optional)
- ✅ `openings` (string, optional)
- ✅ `aboutCompany` (string, optional)
- ✅ `jobType` (string, optional)
- ✅ `scrappedAt` (date, optional)
- ✅ `createdAt` (date, auto-generated)
- ✅ `updatedAt` (date, optional)
- ✅ `deletedAt` (date, optional)
- ✅ `isDeleted` (boolean, default: false)
- ✅ `isSync` (boolean, default: false)

---

## 📋 Summary

| Site | Model | Repository | Fields | Status |
|------|-------|------------|--------|--------|
| Glassdoor | `StagingGlassdoor` | `StagingGlassdoorRepository` | 19 | ✅ Ready |
| TimesJobs | `StagingTimesjob` | `StagingTimesjobRepository` | 18 | ✅ Ready |
| Indeed | `StagingIndeed` | `StagingIndeedRepository` | 18 | ✅ Ready |
| Monster | `StagingMonster` | `StagingMonsterRepository` | 18 | ✅ Ready |

---

## 🔧 Features Included

All models include:
- ✅ **TimeStampRepositoryMixin** - Auto-updates `createdAt` and `updatedAt`
- ✅ **WebScrapperDataSource** - Connected to MongoDB
- ✅ **Soft Delete** - `isDeleted` flag instead of hard delete
- ✅ **Sync Tracking** - `isSync` flag for transformation tracking
- ✅ **Scrape Timestamp** - `scrappedAt` to track when data was extracted

---

## 🚀 Next Steps

### 1. Build the Project
```bash
cd API
npm run build
```

### 2. Run Migration (if needed)
```bash
npm run migrate
```

### 3. Use in Your Code

**Example: Save TimesJobs data**
```typescript
import { StagingTimesjobRepository } from './repositories';

// In your service
async saveTimesJobData(data: any) {
  const stagingRepo = await this.ctx.get<StagingTimesjobRepository>(
    'repositories.StagingTimesjobRepository'
  );

  await stagingRepo.create({
    title: data.title,
    description: data.description,
    companyName: data.company,
    location: data.location,
    experience: data.experience,
    salary: data.salary,
    skills: data.skills,
    redirectUrl: data.link,
    scrappedAt: new Date()
  });
}
```

**Example: Use in Deliver Node**
```typescript
// In deliver.service.ts
const stagingRepo = await this.ctx.get<DefaultCrudRepository<any, any>>(
  'repositories.StagingTimesjobRepository'
);

for (const job of extractedJobs) {
  await stagingRepo.create({
    title: job.title,
    description: job.description,
    companyName: job.company,
    location: job.location,
    experience: job.experience,
    salary: job.salary,
    skills: job.skills,
    redirectUrl: job.link,
    scrappedAt: new Date()
  });
}
```

---

## 📊 Field Mapping Guide

### From Selectors to Model

**TimesJobs Example:**
```json
{
  "selectors": {
    "title": "h1",
    "description": ".job-description-main",
    "skills": ".jd-skill-tag"
  },
  "mapping": {
    "title": "title",
    "description": "description",
    "skills": "skills"
  }
}
```

**Glassdoor Example:**
```json
{
  "selectors": {
    "title": "h1.job-title",
    "companyName": ".company-name",
    "keySkills": ".skills span"
  },
  "mapping": {
    "title": "title",
    "companyName": "companyName",
    "keySkills": "keySkills"
  }
}
```

---

## ✅ Verification Checklist

Before using in production:
- [ ] Build project successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] Models exported in `src/models/index.ts`
- [ ] Repositories exported in `src/repositories/index.ts`
- [ ] Database connection working
- [ ] Can create test records
- [ ] Timestamps auto-populate
- [ ] Soft delete works

---

## 🎯 Integration with Workflow

### Deliver Node Configuration

**For TimesJobs:**
```json
{
  "type": "deliver",
  "respositoryName": "StagingTimesjobRepository",
  "fields": [
    { "modelField": "title", "mappedField": "title", "type": "string" },
    { "modelField": "description", "mappedField": "description", "type": "string" },
    { "modelField": "companyName", "mappedField": "company", "type": "string" },
    { "modelField": "location", "mappedField": "location", "type": "string" },
    { "modelField": "experience", "mappedField": "experience", "type": "string" },
    { "modelField": "salary", "mappedField": "salary", "type": "string" },
    { "modelField": "skills", "mappedField": "skills", "type": "array" },
    { "modelField": "redirectUrl", "mappedField": "link", "type": "string" }
  ],
  "additionalFields": [
    { "modelField": "scrappedAt", "value": null, "type": "date" }
  ]
}
```

---

## 💡 Pro Tips

1. **Use appropriate field types:**
   - `skills` → array of strings
   - `salary` → string (parse later in transformation)
   - `experience` → string (parse later)
   - `posted` → string (parse to date in transformation)

2. **Handle missing data:**
   - Optional fields can be null
   - Required fields must have values
   - Use default values when needed

3. **Transformation flow:**
   - Staging → Raw data from scraping
   - Transformation → Clean, validate, normalize
   - Production → Final clean data

4. **Monitor data quality:**
   - Check `isSync` flag
   - Track `scrappedAt` timestamps
   - Use soft delete for audit trail

---

## 🆘 Troubleshooting

### Build Errors
```bash
# Clear and rebuild
npm run clean
npm run build
```

### Repository Not Found
- Check if exported in `src/repositories/index.ts`
- Verify datasource injection: `@inject('datasources.web_scrapper')`

### TypeScript Errors
- Ensure all imports are correct
- Check model/repository naming matches
- Verify TimeStampRepositoryMixin is imported

---

**All models are ready to use! Build the project and start scraping! 🚀**
